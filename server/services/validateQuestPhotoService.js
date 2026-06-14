














const FAIL_OPEN = true; 

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5002';









async function validateQuestPhoto(imageBuffer, mimeType, questRequirement) {
    
    
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








async function generateAiRequirement(title, description) {
    const fetch = globalThis.fetch ?? require('node-fetch');

    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/quest/generate-requirement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description }),
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            console.error(`[AI] generateAiRequirement returned ${response.status}`);
            return `A photo showing completion of the quest: ${title}`;
        }

        const data = await response.json();
        return data.ai_requirement || `A photo showing completion of the quest: ${title}`;
    } catch (err) {
        console.error('[AI] generateAiRequirement error:', err.message);
        return `A photo showing completion of the quest: ${title}`;
    }
}










async function checkPhotoSafety(imageBuffer, mimeType) {
    const fetch = globalThis.fetch ?? require('node-fetch');

    const base64Image = imageBuffer.toString('base64');

    const payload = {
        file_data: base64Image,
        mime_type: mimeType,
    };

    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/photo/check-safety`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error(`[AI] safety check returned ${response.status}: ${text.slice(0, 200)}`);
            return { is_appropriate: true, reason: 'AI safety check error — defaulting to safe.' };
        }

        const data = await response.json();
        return {
            is_appropriate: data.is_appropriate,
            reason: data.reason || '',
        };
    } catch (err) {
        console.error('[AI] checkPhotoSafety error:', err.message);
        return { is_appropriate: true, reason: `AI safety check unreachable: ${err.message}` };
    }
}

module.exports = { validateQuestPhoto, generateAiRequirement, checkPhotoSafety };