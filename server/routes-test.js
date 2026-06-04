const http = require('http');

const BASE_URL = 'http://localhost:5000';
let token = '';
let adminToken = '';
let userId = '';
let adminId = '';

let destinationSlug = '';
let destinationId = '';
let categoryId = '';
let locationId = '';
let questId = '';
let achievementId = '';

const results = [];

// ── HTTP helper ──────────────────────────────────────────────────
function request(method, path, body, useAuth = false, useAdmin = false) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        const activeToken = useAdmin ? adminToken : token;
        if ((useAuth || useAdmin) && activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

        const req = http.request(
            { hostname: 'localhost', port: 5000, path, method, headers },
            (res) => {
                let raw = '';
                res.on('data', (c) => (raw += c));
                res.on('end', () => {
                    try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                    catch { resolve({ status: res.statusCode, body: raw }); }
                });
            }
        );
        req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
        if (data) req.write(data);
        req.end();
    });
}

function log(label, res, expectStatus) {
    const ok = res.status === expectStatus;
    const color = ok ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${ok ? '✓' : '✗'}\x1b[0m [${res.status}] ${label}`);
    if (!ok) console.log('    →', JSON.stringify(res.body));
    results.push({ label, ok });
    return ok;
}

function note(msg) {
    console.log(`  \x1b[2m⚠ ${msg}\x1b[0m`);
}

function section(name) {
    const line = '─'.repeat(Math.max(0, 46 - name.length));
    console.log(`\n\x1b[2m── ${name} ${line}\x1b[0m`);
}

function extractId(res) {
    return res.body?.data?._id || res.body?._id || null;
}

// ── Main ─────────────────────────────────────────────────────────
async function run() {
    console.log('\n\x1b[1mRunning full API test suite against', BASE_URL, '\x1b[0m');

    const ts = Date.now();
    const testEmail = `test_${ts}@example.com`;
    const testUsername = `testuser_${ts}`;

    // ── Change these to your admin credentials ───────────────────
    const adminEmail = 'hosaamazzam.admin@gmail.com';
    const adminPassword = 'Test@1234';
    // ─────────────────────────────────────────────────────────────

    // ════════════════════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════════════════════
    section('Auth — happy path');

    let r = await request('POST', '/api/auth/register', {
        name: 'Test User', email: testEmail, password: 'Test@1234', username: testUsername,
    });
    log('POST /api/auth/register', r, 201);
    if (r.body?.token) token = r.body.token;
    if (r.body?.user?._id) userId = r.body.user._id;

    r = await request('POST', '/api/auth/login', { email: testEmail, password: 'Test@1234' });
    log('POST /api/auth/login', r, 200);
    if (r.body?.token) token = r.body.token;

    r = await request('GET', '/api/auth/me', null, true);
    log('GET  /api/auth/me', r, 200);

    r = await request('POST', '/api/auth/login', { email: adminEmail, password: adminPassword });
    log('POST /api/auth/login (admin)', r, 200);
    if (r.body?.token) adminToken = r.body.token;
    if (r.body?.user?._id) adminId = r.body.user._id;

    section('Auth — error cases');

    r = await request('POST', '/api/auth/register', {
        name: 'Dup', email: testEmail, password: 'Test@1234', username: `other_${ts}`,
    });
    log('POST /api/auth/register (duplicate email → 400)', r, 400);

    r = await request('POST', '/api/auth/register', {
        name: 'Dup', email: `other_${ts}@example.com`, password: 'Test@1234', username: testUsername,
    });
    log('POST /api/auth/register (duplicate username → 400)', r, 400);

    r = await request('POST', '/api/auth/register', { email: testEmail, password: 'Test@1234' });
    log('POST /api/auth/register (missing name → 400)', r, 400);

    r = await request('POST', '/api/auth/login', { email: testEmail, password: 'WrongPass' });
    log('POST /api/auth/login (wrong password → 401)', r, 401);

    r = await request('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'Test@1234' });
    log('POST /api/auth/login (unknown email → 401)', r, 401);

    r = await request('GET', '/api/auth/me', null, false);
    log('GET  /api/auth/me (no token → 401)', r, 401);

    section('Auth — admin routes');

    r = await request('GET', '/api/auth/users', null, false, true);
    log('GET  /api/auth/users (admin → 200)', r, 200);

    r = await request('GET', '/api/auth/users', null, true, false);
    log('GET  /api/auth/users (non-admin → 403)', r, 403);

    r = await request('GET', `/api/auth/users/${userId}`, null, false, true);
    log('GET  /api/auth/users/:id (admin → 200)', r, 200);

    r = await request('GET', '/api/auth/users/000000000000000000000000', null, false, true);
    log('GET  /api/auth/users/:id (not found → 404)', r, 404);

    r = await request('PUT', `/api/auth/users/${userId}/ban`, null, false, true);
    log('PUT  /api/auth/users/:id/ban (toggle → 200)', r, 200);

    r = await request('PUT', `/api/auth/users/${adminId}/ban`, null, false, true);
    log('PUT  /api/auth/users/:id/ban (self-ban → 400)', r, 400);

    // Unban test user so token stays valid
    await request('PUT', `/api/auth/users/${userId}/ban`, null, false, true);

    //reset token
    r = await request('POST', '/api/auth/login', { email: testEmail, password: 'Test@1234' });
    if (r.body?.token) token = r.body.token;

    // ════════════════════════════════════════════════════════════
    // DESTINATIONS
    // Note: POST/PUT use single('image') upload middleware.
    // JSON-only requests will be rejected. Skipping create/update.
    // ════════════════════════════════════════════════════════════
    section('Destinations');

    r = await request('GET', '/api/destinations', null, true);
    log('GET  /api/destinations', r, 200);

    // Grab first destination slug from list for further tests
    const destinations = r.body?.data || r.body?.destinations || [];
    if (destinations.length > 0) {
        destinationSlug = destinations[0].slug;
        destinationId = destinations[0]._id;

        r = await request('GET', `/api/destinations/${destinationSlug}`, null, true);
        log('GET  /api/destinations/:slug', r, 200);

        r = await request('GET', `/api/destinations/${destinationId}/details`, null, true);
        log('GET  /api/destinations/:id/details', r, 200);
    } else {
        note('No destinations in DB — skipping GET /:slug and /:id/details');
    }

    r = await request('GET', '/api/destinations/nonexistent-slug-xyz', null, true);
    log('GET  /api/destinations/:slug (not found → 404)', r, 404);

    r = await request('POST', '/api/destinations', { name: 'No auth', slug: 'x', budget: 10 }, true, false);
    log('POST /api/destinations (non-admin → 403)', r, 403);

    note('POST/PUT /api/destinations require multipart/form-data (image upload) — skipped in JSON test');

    // ════════════════════════════════════════════════════════════
    // CATEGORIES
    // ════════════════════════════════════════════════════════════
    section('Categories');

    r = await request('GET', '/api/categories', null, true);
    log('GET  /api/categories', r, 200);

    r = await request('POST', '/api/categories', {
        name: `Test Category ${ts}`, type: 'place', icon: 'test-icon',
    }, false, true);
    log('POST /api/categories (admin → 201)', r, 201);
    categoryId = extractId(r);

    if (categoryId) {
        r = await request('PUT', `/api/categories/${categoryId}`, { name: 'Updated Category' }, false, true);
        log('PUT  /api/categories/:id (admin → 200)', r, 200);
    }

    r = await request('POST', '/api/categories', { name: 'Missing type' }, false, true);
    log('POST /api/categories (missing type → 400/500)', r, 400);

    r = await request('POST', '/api/categories', { name: 'No auth', type: 'place' }, true, false);
    log('POST /api/categories (non-admin → 403)', r, 403);

    // ════════════════════════════════════════════════════════════
    // PLACES / RESTAURANTS / HOTELS
    // All use listingRouter with fields() upload middleware.
    // POST/PUT require multipart/form-data — skipped.
    // ════════════════════════════════════════════════════════════
    section('Places');

    r = await request('GET', '/api/places', null, true);
    log('GET  /api/places', r, 200);

    r = await request('GET', '/api/places/000000000000000000000000', null, true);
    log('GET  /api/places/:id (not found → 404)', r, 404);

    note('POST/PUT /api/places require multipart/form-data (coverImage upload) — skipped in JSON test');

    section('Restaurants');

    r = await request('GET', '/api/restaurants', null, true);
    log('GET  /api/restaurants', r, 200);

    r = await request('GET', '/api/restaurants/000000000000000000000000', null, true);
    log('GET  /api/restaurants/:id (not found → 404)', r, 404);

    note('POST/PUT /api/restaurants require multipart/form-data — skipped in JSON test');

    section('Hotels');

    r = await request('GET', '/api/hotels', null, true);
    log('GET  /api/hotels', r, 200);

    r = await request('GET', '/api/hotels/000000000000000000000000', null, true);
    log('GET  /api/hotels/:id (not found → 404)', r, 404);

    note('POST/PUT /api/hotels require multipart/form-data — skipped in JSON test');

    // ════════════════════════════════════════════════════════════
    // EVENTS
    // POST/PUT use fields() upload middleware — skipped.
    // ════════════════════════════════════════════════════════════
    section('Events');

    r = await request('GET', '/api/events', null, true);
    log('GET  /api/events', r, 200);

    r = await request('GET', '/api/events/000000000000000000000000', null, true);
    log('GET  /api/events/:id (not found → 404)', r, 404);

    note('POST/PUT /api/events require multipart/form-data (coverImage upload) — skipped in JSON test');

    // ════════════════════════════════════════════════════════════
    // SAVED
    // ════════════════════════════════════════════════════════════
    section('Saved');

    r = await request('GET', '/api/saved', null, true);
    log('GET  /api/saved', r, 200);

    r = await request('GET', '/api/saved', null, false);
    log('GET  /api/saved (no token → 401)', r, 401);

    // Only test save/unsave if we have a real entity id
    const firstPlace = (r.body?.data || [])[0];
    if (destinationId) {
        r = await request('POST', '/api/saved', { entityId: destinationId, entityType: 'destination' }, true);
        log('POST /api/saved (save destination → 201)', r, 201);
        const savedItemId = r.body?.data?._id;

        if (savedItemId) {
            r = await request('DELETE', `/api/saved/${savedItemId}`, null, true);
            log('DELETE /api/saved/:id (unsave → 200)', r, 200);
        }
    } else {
        note('No destination ID available — skipping save/unsave test');
    }

    r = await request('POST', '/api/saved', { entityId: '000000000000000000000000', entityType: 'place' }, true);
    log('POST /api/saved (non-existent entity → 404)', r, 404);

    // ════════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ════════════════════════════════════════════════════════════
    section('Notifications');

    r = await request('GET', '/api/notifications', null, true);
    log('GET  /api/notifications', r, 200);

    r = await request('PUT', '/api/notifications/read-all', null, true);
    log('PUT  /api/notifications/read-all', r, 200);

    r = await request('GET', '/api/notifications', null, false);
    log('GET  /api/notifications (no token → 401)', r, 401);

    // ════════════════════════════════════════════════════════════
    // ACHIEVEMENTS
    // ════════════════════════════════════════════════════════════
    section('Achievements');

    r = await request('GET', '/api/achievements', null, true);
    log('GET  /api/achievements', r, 200);

    r = await request('GET', '/api/achievements/me', null, true);
    log('GET  /api/achievements/me', r, 200);

    r = await request('POST', '/api/achievements', {
        name: `Test Achievement ${ts}`,
        triggerType: 'visit_count',
        triggerValue: 10,
    }, false, true);
    log('POST /api/achievements (admin → 201)', r, 201);
    achievementId = extractId(r);

    r = await request('GET', '/api/achievements/000000000000000000000000', null, true);
    log('GET  /api/achievements/:id (not found → 404)', r, 404);

    r = await request('POST', '/api/achievements', { name: 'Missing fields' }, false, true);
    log('POST /api/achievements (missing triggerType → 400/500)', r, 400);

    r = await request('POST', '/api/achievements', {
        name: 'No auth', triggerType: 'visit_count', triggerValue: 5,
    }, true, false);
    log('POST /api/achievements (non-admin → 403)', r, 403);

    // ════════════════════════════════════════════════════════════
    // LOCATIONS
    // ════════════════════════════════════════════════════════════
    section('Locations');

    r = await request('GET', '/api/locations', null, true);
    log('GET  /api/locations', r, 200);

    r = await request('POST', '/api/locations', {
        name: 'موقع تجريبي',
        name_en: `Test Location ${ts}`,
        description: 'وصف',
        description_en: 'A test location',
        coordinates: { lat: 31.9544, lng: 35.9106 },
        xp_reward: 100,
        budget_category: 'Low',
    }, false, true);
    log('POST /api/locations (admin → 201)', r, 201);
    locationId = extractId(r);

    if (locationId) {
        r = await request('GET', `/api/locations/${locationId}`, null, true);
        log('GET  /api/locations/:id', r, 200);

        r = await request('PUT', `/api/locations/${locationId}`, { name_en: 'Updated Location' }, false, true);
        log('PUT  /api/locations/:id (admin → 200)', r, 200);

        r = await request('GET', `/api/locations/${locationId}/posts`, null, true);
        log('GET  /api/locations/:id/posts', r, 200);

        r = await request('POST', `/api/locations/${locationId}/posts`, {
            content: 'Test post from test suite',
        }, true);
        log('POST /api/locations/:id/posts (user → 201)', r, 201);

        note('POST /api/locations/:id/complete-task requires multipart/form-data (photo upload) — skipped');
    }

    r = await request('GET', '/api/locations/000000000000000000000000', null, true);
    log('GET  /api/locations/:id (not found → 404)', r, 404);

    r = await request('POST', '/api/locations', { name: 'Missing name_en' }, false, true);
    log('POST /api/locations (missing required fields → 400/500)', r, 400);

    // ════════════════════════════════════════════════════════════
    // QUESTS
    // ════════════════════════════════════════════════════════════
    section('Quests');

    r = await request('GET', '/api/quests', null, false);
    log('GET  /api/quests (public → 200)', r, 200);

    r = await request('POST', '/api/quests', {
        title: `Test Quest ${ts}`,
        title_en: 'Test Quest EN',
        description: 'وصف مهمة',
        description_en: 'A test quest',
        bonus_xp: 200,
        locations: locationId ? [locationId] : [],
    }, false, true);
    log('POST /api/quests (admin → 201)', r, 201);
    questId = extractId(r);

    if (questId) {
        r = await request('GET', `/api/quests/${questId}`, null, false);
        log('GET  /api/quests/:id', r, 200);

        r = await request('PUT', `/api/quests/${questId}`, { title_en: 'Updated Quest' }, false, true);
        log('PUT  /api/quests/:id (admin → 200)', r, 200);
    }

    r = await request('GET', '/api/quests/000000000000000000000000', null, false);
    log('GET  /api/quests/:id (not found → 404)', r, 404);

    r = await request('POST', '/api/quests', { title: 'No auth' }, true, false);
    log('POST /api/quests (non-admin → 403)', r, 403);

    // ════════════════════════════════════════════════════════════
    // PHOTOS
    // ════════════════════════════════════════════════════════════
    section('Photos');

    r = await request('GET', '/api/photos', null, false);
    log('GET  /api/photos (public → 200)', r, 200);

    r = await request('GET', '/api/photos/reported', null, false, true);
    log('GET  /api/photos/reported (admin → 200)', r, 200);

    r = await request('GET', '/api/photos/reported', null, true, false);
    log('GET  /api/photos/reported (non-admin → 403)', r, 403);

    note('POST photo (complete-task) requires multipart/form-data — tested under /api/locations');

    // ════════════════════════════════════════════════════════════
    // GAME
    // ════════════════════════════════════════════════════════════
    section('Game');

    r = await request('GET', '/api/leaderboard', null, false);
    log('GET  /api/leaderboard (public → 200)', r, 200);

    // GET /api/users/:id/profile — use adminId since we know it exists
    if (adminId) {
        r = await request('GET', `/api/users/${adminId}/profile`, null, false);
        log('GET  /api/users/:id/profile', r, 200);
    }

    r = await request('POST', '/api/user/update-frame', { frameSlug: 'default-frame' }, true);
    log('POST /api/user/update-frame', r, 200);

    r = await request('POST', '/api/user/update-frame', null, false);
    log('POST /api/user/update-frame (no token → 401)', r, 401);

    // ════════════════════════════════════════════════════════════
    // ADMIN ROUTES
    // ════════════════════════════════════════════════════════════
    section('Admin');

    r = await request('GET', '/api/admin/settings/budget', null, false, true);
    log('GET  /api/admin/settings/budget (admin → 200)', r, 200);

    r = await request('GET', '/api/admin/settings/budget', null, true, false);
    log('GET  /api/admin/settings/budget (non-admin → 403)', r, 403);

    r = await request('GET', '/api/admin/reported-photos', null, false, true);
    log('GET  /api/admin/reported-photos (admin → 200)', r, 200);

    note('POST /api/admin/upload-asset requires multipart/form-data — skipped');

    // ════════════════════════════════════════════════════════════
    // CLEANUP
    // ════════════════════════════════════════════════════════════
    section('Cleanup');

    if (questId) {
        r = await request('DELETE', `/api/quests/${questId}`, null, false, true);
        log('DELETE /api/quests/:id', r, 200);
    }
    if (locationId) {
        r = await request('DELETE', `/api/locations/${locationId}`, null, false, true);
        log('DELETE /api/locations/:id', r, 200);
    }
    if (categoryId) {
        r = await request('DELETE', `/api/categories/${categoryId}`, null, false, true);
        log('DELETE /api/categories/:id', r, 200);
    }
    if (userId) {
        r = await request('DELETE', `/api/auth/users/${userId}`, null, false, true);
        log('DELETE /api/auth/users/:id (test user)', r, 200);
    }

    r = await request('POST', '/api/auth/logout', null, false, true);
    log('POST /api/auth/logout', r, 200);

    // ════════════════════════════════════════════════════════════
    // SUMMARY
    // ════════════════════════════════════════════════════════════
    const passed = results.filter((x) => x.ok).length;
    const failed = results.filter((x) => !x.ok).length;

    console.log('\n' + '═'.repeat(50));
    console.log(`\x1b[1mResults:  \x1b[32m${passed} passed\x1b[0m  \x1b[31m${failed} failed\x1b[0m  /  ${results.length} total\x1b[0m`);

    if (failed > 0) {
        console.log('\n\x1b[31mFailed tests:\x1b[0m');
        results.filter((x) => !x.ok).forEach((x) => console.log(`  • ${x.label}`));
    }

    console.log('');
}

run();