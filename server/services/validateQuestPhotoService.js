/**
 * aiService.js
 *
 * Calls the Python/Gemini service (running on AI_SERVICE_URL, default port 5002)
 * to validate quest photo submissions.
 *
 * Returns:
 *   { is_appropriate: bool, fulfills_quest: bool, reason: string }
 *
 * If the AI service is unreachable or returns an error, we fail OPEN —
 * meaning we treat the photo as appropriate and fulfilling the quest,
 * so a network hiccup never blocks a user from completing a quest.
 * Change FAIL_OPEN to false if you want the stricter opposite behaviour.
 */

const FAIL_OPEN = true; // flip to false to block on AI service errors

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

/**
 * Validate a quest photo via the Gemini AI service.
 *
 * @param {Buffer}  imageBuffer     - Raw image buffer from multer (req.file.buffer)
 * @param {string}  mimeType        - e.g. 'image/jpeg'
 * @param {string}  questRequirement - The quest's ai_requirement field value
 * @returns {Promise<{ is_appropriate: boolean, fulfills_quest: boolean, reason: string }>}
 */
async function validateQuestPhoto(imageBuffer, mimeType, questRequirement) {
    // Lazy-require node-fetch so this works with both CJS fetch polyfills
    // and Node 18+ native fetch.  If you're on Node 18+, remove the require.
    const fetch = globalThis.fetch ?? require('node-fetch');

    const base64Image = imageBuffer.toString('base64');

    const payload = {
        file_data: base64Image,
        mime_type: mimeType,
        quest_requirement: questRequirement,
    };

    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/quest/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            // 15-second timeout so a slow AI service doesn't hang the request
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error(`[AI] Service returned ${response.status}: ${text.slice(0, 200)}`);
            return failOpenResult('AI service error — defaulting to open.');
        }

        const data = await response.json();

        // Validate shape — guard against unexpected API changes
        if (
            typeof data.is_appropriate !== 'boolean' ||
            typeof data.fulfills_quest !== 'boolean'
        ) {
            console.error('[AI] Unexpected response shape:', data);
            return failOpenResult('AI response malformed — defaulting to open.');
        }

        return {
            is_appropriate: data.is_appropriate,
            fulfills_quest: data.fulfills_quest,
            reason: data.reason || '',
        };
    } catch (err) {
        // Network error, timeout, JSON parse failure, etc.
        console.error('[AI] validateQuestPhoto error:', err.message);
        return failOpenResult(`AI service unreachable: ${err.message}`);
    }
}

function failOpenResult(reason) {
    if (FAIL_OPEN) {
        return { is_appropriate: true, fulfills_quest: true, reason };
    }
    return {
        is_appropriate: true,        // never flag as inappropriate on a network error
        fulfills_quest: false,        // but don't auto-complete the quest
        reason: 'Photo validation unavailable. Please try again.',
    };
}

module.exports = { validateQuestPhoto };