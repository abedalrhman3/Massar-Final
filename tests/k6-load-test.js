import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";


const errorRate = new Rate("errors");
const authDuration = new Trend("auth_duration", true);
const dbDuration = new Trend("db_duration", true);


const BASE_URL = "http://localhost:5000";

const ADMIN = {
    email: "hosaamazzam.admin@gmail.com",
    password: "hosaam25Z@",
};


export const options = {
    stages: [
        { duration: "30s", target: 10 },   
        { duration: "1m", target: 50 },   
        { duration: "1m", target: 50 },   
        { duration: "30s", target: 0 },   
    ],
    thresholds: {
        http_req_failed: ["rate<0.05"],    
        http_req_duration: ["p(95)<5000"],   
        errors: ["rate<0.05"],    
        auth_duration: ["p(95)<7000"],   
        db_duration: ["p(95)<3000"],   
    },
};


function jsonHeaders(token = null) {
    const h = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return { headers: h };
}

function uid() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function firstId(res, ...keys) {
    for (const k of keys) {
        const val = res.json(k);
        if (val) return val;
    }
    
    try {
        const arr = res.json("data");
        if (Array.isArray(arr) && arr.length > 0) return arr[0]._id;
    } catch (_) { }
    return null;
}


export default function () {
    let userToken = null;
    let userId = null;
    let adminToken = null;

    
    let destinationId = null;
    let destinationSlug = null;
    let locationId = null;
    let questId = null;
    let categoryId = null;
    let savedItemId = null;
    let commentId = null;

    
    group("Auth Flow", () => {
        const id = uid();
        const email = `load_${id}@test.com`;

        
        const reg = http.post(
            `${BASE_URL}/api/auth/register`,
            JSON.stringify({
                name: `LoadUser ${id}`,
                email,
                password: "Test@1234",
                username: `load_${id}`,
            }),
            jsonHeaders()
        );
        const regOk = check(reg, { "register: 201": (r) => r.status === 201 });
        errorRate.add(!regOk);

        
        if (regOk) {
            http.post(
                `${BASE_URL}/api/test/verify-user`,
                JSON.stringify({ email }),
                jsonHeaders()
            );
        }
        

        
        const t0 = Date.now();
        const login = http.post(
            `${BASE_URL}/api/auth/login`,
            JSON.stringify({ email, password: "Test@1234" }),
            jsonHeaders()
        );
        authDuration.add(Date.now() - t0);

        const loginOk = check(login, {
            "login: 200": (r) => r.status === 200,
            "login: has token": (r) => !!r.json("token"),
        });
        errorRate.add(!loginOk);
        if (loginOk) {
            userToken = login.json("token");
            userId = login.json("user._id") || login.json("user.id");
        }



        
        if (userToken) {
            const me = http.get(`${BASE_URL}/api/auth/me`, jsonHeaders(userToken));
            check(me, { "GET /me: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        const adminLogin = http.post(
            `${BASE_URL}/api/auth/login`,
            JSON.stringify(ADMIN),
            jsonHeaders()
        );
        const adminOk = check(adminLogin, { "admin login: 200": (r) => r.status === 200 });
        errorRate.add(!adminOk);
        if (adminOk) adminToken = adminLogin.json("token");
    });

    sleep(1);
    if (!userToken) return;

    
    group("Public Reads", () => {
        
        const t0 = Date.now();
        const dests = http.get(`${BASE_URL}/api/destinations`, jsonHeaders(userToken));
        dbDuration.add(Date.now() - t0);
        check(dests, { "GET /destinations: 200": (r) => r.status === 200 }) || errorRate.add(1);

        try {
            const arr = dests.json("data");
            if (Array.isArray(arr) && arr.length > 0) {
                destinationSlug = arr[0].slug;
                destinationId = arr[0]._id;
            }
        } catch (_) { }

        
        if (destinationSlug) {
            const d = http.get(`${BASE_URL}/api/destinations/${destinationSlug}`, jsonHeaders(userToken));
            check(d, { "GET /destinations/:slug: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        if (destinationId) {
            const dd = http.get(`${BASE_URL}/api/destinations/details/${destinationId}`, jsonHeaders(userToken));
            check(dd, { "GET /destinations/details/:id: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        for (const path of ["/api/places", "/api/restaurants", "/api/hotels", "/api/events"]) {
            const t1 = Date.now();
            const res = http.get(`${BASE_URL}${path}`, jsonHeaders(userToken));
            dbDuration.add(Date.now() - t1);
            check(res, { [`GET ${path}: 200`]: (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        const locs = http.get(`${BASE_URL}/api/locations`, jsonHeaders(userToken));
        check(locs, { "GET /locations: 200": (r) => r.status === 200 }) || errorRate.add(1);
        try {
            const arr = locs.json("data");
            if (Array.isArray(arr) && arr.length > 0) locationId = arr[0]._id;
        } catch (_) { }

        
        const quests = http.get(`${BASE_URL}/api/quests`, jsonHeaders());
        check(quests, { "GET /quests: 200": (r) => r.status === 200 }) || errorRate.add(1);
        try {
            const arr = quests.json("data");
            if (Array.isArray(arr) && arr.length > 0) questId = arr[0]._id;
        } catch (_) { }

        
        const cats = http.get(`${BASE_URL}/api/categories`, jsonHeaders());
        check(cats, { "GET /categories: 200": (r) => r.status === 200 }) || errorRate.add(1);
        try {
            const arr = cats.json("data");
            if (Array.isArray(arr) && arr.length > 0) categoryId = arr[0]._id;
        } catch (_) { }

        
        const ach = http.get(`${BASE_URL}/api/achievements`, jsonHeaders());
        check(ach, { "GET /achievements: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const lb = http.get(`${BASE_URL}/api/game/leaderboard`, jsonHeaders());
        check(lb, { "GET /game/leaderboard: 200": (r) => r.status === 200 }) || errorRate.add(1);

        const photos = http.get(`${BASE_URL}/api/photos`, jsonHeaders());
        check(photos, { "GET /photos: 200": (r) => r.status === 200 }) || errorRate.add(1);
    });

    sleep(1);

    
    group("User Actions", () => {
        
        const myAch = http.get(`${BASE_URL}/api/achievements/me`, jsonHeaders(userToken));
        check(myAch, { "GET /achievements/me: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const notifs = http.get(`${BASE_URL}/api/notifications`, jsonHeaders(userToken));
        check(notifs, { "GET /notifications: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const markAll = http.put(`${BASE_URL}/api/notifications/read-all`, null, jsonHeaders(userToken));
        check(markAll, { "PUT /notifications/read-all: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const saved = http.get(`${BASE_URL}/api/saved`, jsonHeaders(userToken));
        check(saved, { "GET /saved: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        if (destinationId) {
            const saveRes = http.post(
                `${BASE_URL}/api/saved`,
                JSON.stringify({ entityId: destinationId, entityType: "destination" }),
                jsonHeaders(userToken)
            );
            const saveOk = check(saveRes, {
                "POST /saved: 201 or 400": (r) => [201, 400].includes(r.status), 
            });
            errorRate.add(!saveOk);
            if (saveRes.status === 201) {
                savedItemId = saveRes.json("data._id") || saveRes.json("_id");
            }
        }

        
        if (destinationId) {
            const like = http.post(`${BASE_URL}/api/destinations/${destinationId}/like`, null, jsonHeaders(userToken));
            if (![200, 409].includes(like.status)) {
                console.log(`like failed: ${like.status} — ${like.body}`);
            }
            check(like, { "POST /destinations/:id/like: 200 or 409": (r) => [200, 409].includes(r.status) }) || errorRate.add(1);
        }

        
        if (destinationId) {
            const comment = http.post(
                `${BASE_URL}/api/comments`,
                JSON.stringify({ placeId: destinationId, text: `Load test comment ${uid()}` }),
                jsonHeaders(userToken)
            );
            const commentOk = check(comment, { "POST /comments: 201": (r) => r.status === 201 });
            errorRate.add(!commentOk);
            if (commentOk) {
                commentId = comment.json("data.id") || comment.json("data._id");
            }
        }

        
        if (destinationId) {
            const comments = http.get(
                `${BASE_URL}/api/comments?placeId=${destinationId}`,
                jsonHeaders(userToken)
            );
            check(comments, { "GET /comments: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        if (commentId) {
            const likeComment = http.post(
                `${BASE_URL}/api/comments/${commentId}/like`,
                null,
                jsonHeaders(userToken)
            );
            check(likeComment, { "POST /comments/:id/like: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        if (questId) {
            const join = http.post(`${BASE_URL}/api/quests/${questId}/join`, null, jsonHeaders(userToken));
            check(join, { "POST /quests/:id/join: 200 or 400": (r) => [200, 400].includes(r.status) }) || errorRate.add(1);
        }

        
        const frame = http.post(
            `${BASE_URL}/api/game/user/update-frame`,
            JSON.stringify({ frameSlug: "default-frame" }),
            jsonHeaders(userToken)
        );
        check(frame, { "POST /game/user/update-frame: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const profile = http.put(
            `${BASE_URL}/api/auth/update-profile`,
            JSON.stringify({ name: `LoadUser ${uid()}` }),
            jsonHeaders(userToken)
        );
        check(profile, { "PUT /auth/update-profile: 200": (r) => r.status === 200 }) || errorRate.add(1);
    });

    sleep(1);

    
    group("Location Community", () => {
        if (!locationId) return;

        
        const posts = http.get(`${BASE_URL}/api/locations/${locationId}/posts`, jsonHeaders(userToken));
        check(posts, { "GET /locations/:id/posts: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        const newPost = http.post(
            `${BASE_URL}/api/locations/${locationId}/posts`,
            JSON.stringify({ content: `Load test post ${uid()}` }),
            jsonHeaders(userToken)
        );
        check(newPost, { "POST /locations/:id/posts: 201": (r) => r.status === 201 }) || errorRate.add(1);

        
        if (userToken) {
            const userId2 = http.get(`${BASE_URL}/api/auth/me`, jsonHeaders(userToken)).json("_id")
                || http.get(`${BASE_URL}/api/auth/me`, jsonHeaders(userToken)).json("data._id");
            if (userId2) {
                const gp = http.get(`${BASE_URL}/api/game/users/${userId2}/profile`, jsonHeaders());
                check(gp, { "GET /game/users/:id/profile: 200": (r) => r.status === 200 }) || errorRate.add(1);
            }
        }
    });

    sleep(1);

    
    group("Cleanup", () => {
        
        if (savedItemId) {
            const unsave = http.del(`${BASE_URL}/api/saved/${savedItemId}`, null, jsonHeaders(userToken));
            check(unsave, { "DELETE /saved/:id: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        if (commentId) {
            const delComment = http.del(`${BASE_URL}/api/comments/${commentId}`, null, jsonHeaders(userToken));
            check(delComment, { "DELETE /comments/:id: 200": (r) => r.status === 200 }) || errorRate.add(1);
        }

        
        const logout = http.post(`${BASE_URL}/api/auth/logout`, null, jsonHeaders(userToken));
        check(logout, { "POST /auth/logout: 200": (r) => r.status === 200 }) || errorRate.add(1);

        
        if (adminToken) {
            http.post(`${BASE_URL}/api/auth/logout`, null, jsonHeaders(adminToken));
        }
    });

    sleep(1);
}