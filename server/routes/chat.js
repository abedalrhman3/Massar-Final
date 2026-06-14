const express = require('express');
const router = express.Router();

console.log('[CHAT] Loading free keyword-based chatbot...');


const SLIDING_WINDOW_MESSAGES = 5;
const SLIDING_WINDOW_SECONDS = 60; 


const userRateWindows = {};


function getClientId(req) {
  return req.ip || req.connection.remoteAddress || 'unknown';
}


function detectLanguage(message) {
  if (!message) return 'en';
  
  const arabicPattern = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
  
  const turkishPattern = /[şığüçöİĞÜÇÖŞĞÜÇÖ]/;

  if (arabicPattern.test(message)) return 'ar';
  if (turkishPattern.test(message)) return 'tr';
  return 'en';
}


function checkSlidingWindowRateLimit(clientId, currentTime) {
  if (!userRateWindows[clientId]) {
    
    userRateWindows[clientId] = {
      firstMessageTime: currentTime,
      count: 1
    };
    return { isLimited: false, unblockTime: 0 };
  }

  const window = userRateWindows[clientId];
  const elapsed = currentTime - window.firstMessageTime;

  
  if (elapsed > SLIDING_WINDOW_SECONDS) {
    userRateWindows[clientId] = {
      firstMessageTime: currentTime,
      count: 1
    };
    return { isLimited: false, unblockTime: 0 };
  }

  
  window.count += 1;

  
  if (window.count > SLIDING_WINDOW_MESSAGES) {
    const unblockTime = window.firstMessageTime + SLIDING_WINDOW_SECONDS;
    const remainingSeconds = Math.ceil(unblockTime - currentTime);
    return {
      isLimited: true,
      unblockTime: unblockTime,
      remainingSeconds: remainingSeconds
    };
  }

  return { isLimited: false, unblockTime: 0 };
}


function formatUnblockTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}


function getRateLimitMessage(unblockTime, detectedLang) {
  const unblockTimeStr = formatUnblockTime(unblockTime);

  const messages = {
    ar: `لقد بلغت الحد المسموح به (${SLIDING_WINDOW_MESSAGES} رسائل في ${SLIDING_WINDOW_SECONDS} ثانية). يرجى المحاولة مرة أخرى في ${unblockTimeStr}`,
    tr: `Dakikada ${SLIDING_WINDOW_MESSAGES} mesaj sınırına ulaştınız. Lütfen ${unblockTimeStr}'de tekrar deneyin`,
    en: `You've sent ${SLIDING_WINDOW_MESSAGES} messages in ${SLIDING_WINDOW_SECONDS} seconds. Please wait until ${unblockTimeStr} to send more.`
  };

  return messages[detectedLang] || messages.en;
}


const Destination = require('../models/Destination');
const DestinationDetail = require('../models/DestinationDetail');
const Place = require('../models/Place');
const Restaurant = require('../models/Restaurant');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');


const NOT_FOUND_MESSAGE = `This destination hasn't been added by us yet, but it might be in the future! Would you like me to recommend some other stunning places instead? 🌟

You can ask about places like:
🏛️ Petra - The famous Rose City
🏜️ Wadi Rum - Stunning desert landscapes
🏛️ Jerash - Ancient Roman ruins
🌊 Dead Sea - The lowest point on Earth
🏰 Amman Citadel - Historic capital views

Which one interests you?`;


const GENERAL_RESPONSES = {
  greetings: [
    "Hello! Welcome to Massar! 🇯🇴 I'm here to help you discover the beautiful destinations of Jordan. Would you like to explore places like Petra, Wadi Rum, Jerash, or the Dead Sea?",
    "Marhaba! 👋 Welcome to your Jordan travel assistant! Ask me about any destination in Jordan and I'll help you plan your trip!",
    "Ahlan wa Sahlan! 🌟 Welcome to Massar! Jordan has amazing places to explore. What would you like to know about?"
  ],
  help: [
    "I can help you discover amazing places in Jordan! Ask me about destinations, historical sites, restaurants, hotels, or events. Just type the name of a place you're interested in! 🏛️🏜️🌊",
    "I'm your Jordan travel guide! You can ask me about:\n🏛️ Destinations (Petra, Jerash, Wadi Rum, etc.)\n🏨 Hotels\n🍽️ Restaurants\n🎉 Events\n\nWhat would you like to know?"
  ],
  thanks: [
    "You're welcome! 😊 Enjoy exploring Jordan with Massar! Let me know if you need anything else.",
    "Glad I could help! 🇯🇴 Have a wonderful time exploring Jordan!",
    "You're welcome! Feel free to ask if you need more information about any destination! 🌟"
  ],
  general: [
    "That's a great question! Jordan has so much to offer. Could you tell me which destination or place you're interested in? 🇯🇴",
    "I'd love to help! What specific place in Jordan would you like to know about?",
    "Jordan is full of amazing places! Are you interested in a specific destination? Just ask!"
  ]
};


function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}


function isGreeting(message) {
  const greetings = ['hello', 'hi', 'hey', 'marhaba', 'ahlan', 'مرحبا', 'السلام'];
  return greetings.some(g => message.toLowerCase().includes(g));
}


function isHelp(message) {
  const helpWords = ['help', 'what can you do', 'how can you help', 'مساعدة', 'كيف تساعدني'];
  return helpWords.some(h => message.toLowerCase().includes(h));
}


function isThanks(message) {
  const thanks = ['thank', 'thanks', 'shukran', 'شكرا', 'appreciate'];
  return thanks.some(t => message.toLowerCase().includes(t));
}


const DESTINATION_KEYWORDS = [
  'petra', 'wadi rum', 'jerash', 'amman', 'dead sea', 'aqaba', 'madaba', 'mount nebo', 'mt nebo',
  'karak', 'ajloun', 'umm qais', 'dana', 'mujib', 'qasr amra', 'little petra', 'siq',
  'destination', 'place', 'visit', 'travel', 'tour', 'trip'
];


function isDestinationQuestion(message) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return DESTINATION_KEYWORDS.some(keyword => lower.includes(keyword));
}


async function searchDatabase(query) {
  const searchTerm = query.toLowerCase().trim();

  
  const destinations = await Destination.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { tagline: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }).limit(5);

  
  let destinationDetails = [];
  if (destinations.length > 0) {
    const destIds = destinations.map(d => d._id);
    destinationDetails = await DestinationDetail.find({
      destinationId: { $in: destIds }
    }).limit(5);
  }

  
  const places = await Place.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { customOverview: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('destinationId', 'name').limit(5);

  
  const restaurants = await Restaurant.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { customOverview: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('destinationId', 'name').limit(5);

  
  const hotels = await Hotel.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { customOverview: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('destinationId', 'name').limit(5);

  
  const events = await Event.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { customOverview: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('destinationId', 'name').limit(5);

  return { destinations, destinationDetails, places, restaurants, hotels, events };
}


function formatDestinationResponse(results) {
  const { destinations, destinationDetails, places, restaurants, hotels, events } = results;

  let foundAny = destinations.length > 0 || places.length > 0 ||
    restaurants.length > 0 || hotels.length > 0 || events.length > 0;

  if (!foundAny) return null;

  let response = '';

  // Format destination info
  if (destinations.length > 0) {
    response += `📍 **Destinations:**\n`;
    destinations.forEach(d => {
      response += `\n**${d.name}**${d.tagline ? ` - ${d.tagline}` : ''}\n`;
      if (d.description) response += `${d.description}\n`;
      if (d.budget) response += `Budget: ${d.budget} JOD\n`;

      const details = destinationDetails.find(dd => dd.destinationId?.toString() === d._id?.toString());
      if (details?.overview) {
        if (details.overview.bestSeason) response += `Best season: ${details.overview.bestSeason}\n`;
        if (details.overview.recommendedStay) response += `Recommended stay: ${details.overview.recommendedStay}\n`;
        if (details.overview.averageCost) response += `Average cost: ${details.overview.averageCost}\n`;
      }
      if (details?.activities?.length > 0) {
        response += `Activities: ${details.activities.map(a => a.name).join(', ')}\n`;
      }
    });
  }

  // Format places/attractions
  if (places.length > 0) {
    response += `\n🏛️ **Places & Attractions:**\n`;
    places.forEach(p => {
      response += `\n• **${p.name}**${p.destinationId?.name ? ` (${p.destinationId.name})` : ''}\n`;
      if (p.customOverview) response += `${p.customOverview}\n`;
    });
  }

  // Format restaurants
  if (restaurants.length > 0) {
    response += `\n🍽️ **Restaurants:**\n`;
    restaurants.forEach(r => {
      response += `\n• **${r.name}**${r.destinationId?.name ? ` (${r.destinationId.name})` : ''}\n`;
      if (r.customOverview) response += `${r.customOverview}\n`;
    });
  }

  // Format hotels
  if (hotels.length > 0) {
    response += `\n🏨 **Hotels:**\n`;
    hotels.forEach(h => {
      response += `\n• **${h.name}**${h.destinationId?.name ? ` (${h.destinationId.name})` : ''}\n`;
      if (h.customOverview) response += `${h.customOverview}\n`;
    });
  }

  // Format events
  if (events.length > 0) {
    response += `\n🎉 **Events:**\n`;
    events.forEach(e => {
      response += `\n• **${e.name}**${e.destinationId?.name ? ` (${e.destinationId.name})` : ''}\n`;
      if (e.customOverview) response += `${e.customOverview}\n`;
    });
  }

  return response;
}

// Chat endpoint
router.post('/', async (req, res) => {
  console.log('[CHAT] ========== NEW CHAT REQUEST ==========');

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ reply: 'Please send a message to start the conversation.' });
    }

    // ===== RATE LIMIT CHECK (early, before any processing) =====
    const clientId = getClientId(req);
    const currentTime = Date.now() / 1000; // Unix timestamp in seconds

    // Detect language from the last user message for response
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const detectedLang = detectLanguage(lastUserMsg?.content || lastUserMsg?.text || '');

    // Check rate limit
    const rateLimitResult = checkSlidingWindowRateLimit(clientId, currentTime);
    if (rateLimitResult.isLimited) {
      console.log(`[RATE LIMIT] Client ${clientId} blocked. Unblock at: ${formatUnblockTime(rateLimitResult.unblockTime)}`);
      return res.status(429).json({
        reply: getRateLimitMessage(rateLimitResult.unblockTime, detectedLang),
        rateLimited: true,
        unblockTime: rateLimitResult.unblockTime
      });
    }

    // Get the last user message
    const lastMessage = messages.filter(m => m.role === 'user').pop();

    if (!lastMessage) {
      return res.json({ reply: getRandomResponse(GENERAL_RESPONSES.greetings) });
    }

    const userMessage = (lastMessage.content || lastMessage.text || '').trim();
    const hasImage = lastMessage.file_data && lastMessage.mime_type;

    console.log('[CHAT] User message:', userMessage);
    console.log('[CHAT] Has image:', hasImage);

    // ===== HANDLE IMAGE UPLOAD =====
    if (hasImage) {
      return res.json({
        reply: `I received your image! 🏞️ To help you with the place in the image, please tell me the name of the destination you're asking about, or try one of these popular spots:\n\n${NOT_FOUND_MESSAGE}`
      });
    }

    // ===== HANDLE TEXT MESSAGE =====

    // Check for greetings
    if (isGreeting(userMessage)) {
      console.log('[CHAT] Detected: Greeting');
      return res.json({ reply: getRandomResponse(GENERAL_RESPONSES.greetings) });
    }

    // Check for thanks
    if (isThanks(userMessage)) {
      console.log('[CHAT] Detected: Thanks');
      return res.json({ reply: getRandomResponse(GENERAL_RESPONSES.thanks) });
    }

    // Check if it's a destination question
    const isDestination = isDestinationQuestion(userMessage);
    console.log('[CHAT] Is destination question:', isDestination);

    if (isDestination) {
      // Search database
      console.log('[CHAT] Searching database for:', userMessage);
      const dbResults = await searchDatabase(userMessage);

      console.log('[CHAT] DB search complete. Found:', {
        destinations: dbResults.destinations.length,
        places: dbResults.places.length,
        restaurants: dbResults.restaurants.length,
        hotels: dbResults.hotels.length,
        events: dbResults.events.length
      });

      const formattedResponse = formatDestinationResponse(dbResults);

      if (!formattedResponse) {
        // Not found in database
        console.log('[CHAT] Place not found in database');
        return res.json({ reply: NOT_FOUND_MESSAGE });
      }

      // Found in database
      console.log('[CHAT] Place found, returning DB data');
      return res.json({
        reply: `${formattedResponse}\n\nWould you like more details about any of these? 🇯🇴`
      });
    }

    
    console.log('[CHAT] General question - using default response');
    return res.json({ reply: getRandomResponse(GENERAL_RESPONSES.general) });

  } catch (error) {
    console.error('[CHAT] ========== ERROR ==========');
    console.error('[CHAT] Error:', error.message);
    console.error('[CHAT] Stack:', error.stack);
    res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

module.exports = router;