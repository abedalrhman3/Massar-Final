/**
 * Massar – Full Jordan Seed Data
 * Covers all 15 destinations shown in the badge image:
 * Petra, Wadi Rum, Dead Sea, Jerash, Amman,
 * Aqaba, Wadi Mujib, Mount Nebo, Madaba, Dana Reserve,
 * Ajloun Castle, Um Qais, Bethany, Shaumari, Azraq Wetland
 *
 * Run: node seed.js
 * Requires MONGODB_URI in env or update the uri below.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ─── Models ────────────────────────────────────────────────────────────────
const Destination = require('../models/Destination');
const DestinationDetail = require('../models/DestinationDetail');
const Place = require('../models/Place');
const Restaurant = require('../models/Restaurant');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');
const Quest = require('../models/Quest');
const Badge = require('../models/Badge');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Massar-main';

// ─── Helpers ───────────────────────────────────────────────────────────────
const pt = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });
const PLACEHOLDER_IMG = 'https://placehold.co/800x600/png';
const img = (slug) => `https://images.massar.jo/${slug}.jpg`;   // swap for real CDN URLs

// ─── Raw Data ──────────────────────────────────────────────────────────────

const destinationsData = [
  // 1 ── PETRA
  {
    name: 'Petra',
    slug: 'petra',
    tagline: 'The Rose-Red City',
    description: 'An ancient Nabataean city carved into rose-red sandstone cliffs, one of the New Seven Wonders of the World.',
    image: img('petra/cover'),
    rating: 4.9,
    budget: 50,
    location: pt(35.4444, 30.3285),
    isPublished: true,
    detail: {
      overview: {
        text: 'Petra is a historic and archaeological city in southern Jordan, famous for its rock-cut architecture and water conduit system.',
        locationText: 'Ma\'an Governorate, southern Jordan',
        recommendedStay: '2–3 days',
        bestSeason: 'Spring (March–May) and Autumn (Sept–Nov)',
        averageCost: '50–150 JOD per day',
      },
      activities: [
        { name: 'Walk the Siq Canyon' },
        { name: 'Climb to the Monastery (Ad Deir)' },
        { name: 'Horse & Carriage Ride' },
        { name: 'Petra by Night candlelit tour' },
        { name: 'High Place of Sacrifice hike' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Drive 3 hours south of Amman via the Desert Highway or King\'s Highway. JETT buses run daily from Amman.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring and autumn for mild weather. Summer is extremely hot; winter can bring cold nights.', sortOrder: 2 },
        { title: 'What to bring', content: 'Comfortable walking shoes, sunscreen, at least 2 litres of water, a hat, and cash for vendors inside.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'The Treasury (Al-Khazneh)', customOverview: 'Petra\'s iconic 40-metre façade carved into rose-red sandstone around the 1st century BC.', budget: '0', location: pt(35.4502, 30.3286), coverImage: img('petra/treasury') },
      { name: 'The Monastery (Ad Deir)', customOverview: 'A massive rock-cut monument reached via 800 steps, offering panoramic desert views.', budget: '0', location: pt(35.4392, 30.3397), coverImage: img('petra/monastery') },
      { name: 'The Roman Theatre', customOverview: 'A 1st-century AD Nabataean theatre with seating for 8,500 carved from the cliff face.', budget: '0', location: pt(35.4483, 30.3268), coverImage: img('petra/theatre') },
    ],
    restaurants: [
      { name: 'The Basin Restaurant', customOverview: 'Open-air buffet inside Petra serving Jordanian mezze and grills, perfect for a midday break.', budget: '15–25 JOD', coverImage: img('petra/basin-restaurant') },
      { name: 'Cave Bar', customOverview: 'A 2,000-year-old Nabataean tomb turned atmospheric bar and restaurant in Wadi Musa.', budget: '20–35 JOD', coverImage: img('petra/cave-bar') },
      { name: 'Al Arabi Restaurant', customOverview: 'Family-run spot in Wadi Musa serving hearty mansaf, maqluba, and fresh meze.', budget: '8–15 JOD', coverImage: img('petra/al-arabi') },
    ],
    hotels: [
      { name: 'Mövenpick Resort Petra', customOverview: 'Luxurious 5-star hotel steps from the Petra gate with stunning views and a rooftop pool.', budget: '120–200 JOD', bookingUrl: 'https://movenpick.com/petra', coverImage: img('petra/movenpick') },
      { name: 'Petra Guest House Hotel', customOverview: 'Comfortable 4-star property located right at the entrance to Petra, superb location.', budget: '60–100 JOD', bookingUrl: '', coverImage: img('petra/guesthouse') },
      { name: 'Rocky Mountain Hotel', customOverview: 'Budget-friendly hotel in Wadi Musa with rooftop terrace and free shuttle to the site.', budget: '25–45 JOD', bookingUrl: '', coverImage: img('petra/rocky-mountain') },
    ],
    event: {
      name: 'Petra by Night',
      customOverview: 'Walk the Siq by the light of 1,500 candles and experience traditional Bedouin music at the Treasury.',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      startTime: '20:30',
      endTime: '22:30',
      startingFromPrice: '17 JOD',
      durationText: '2 hours',
      coverImage: img('petra/petra-by-night'),
      isPublished: true,
    },
    quest: {
      title: 'أسرار البتراء',
      title_en: 'Secrets of Petra',
      description: 'اكتشف روعة مدينة البتراء الوردية من خلال استكشاف خزينتها وديرها ومسرحها الروماني.',
      description_en: 'Uncover the wonders of the Rose-Red City by exploring the Treasury, the Monastery, and the Roman Theatre.',
      bonus_xp: 500,
      title_reward: 'Explorer of the Nabataeans',
      badge_url: img('badges/petra'),
      icon_url: img('icons/petra'),
      start_coordinates: { lat: 30.3285, lng: 35.4444 },
      ai_requirement: 'Take a photo in front of the Treasury facade and describe one Nabataean architectural feature you notice.',
    },
    badge: {
      title: 'فارس البتراء',
      title_en: 'Knight of Petra',
      icon_url: img('badges/petra'),
      is_rare: true,
    },
  },

  // 2 ── WADI RUM
  {
    name: 'Wadi Rum',
    slug: 'wadi-rum',
    tagline: 'Valley of the Moon',
    description: 'A vast protected desert wilderness in southern Jordan with dramatic sandstone mountains, ancient petroglyphs, and Bedouin culture.',
    image: img('wadi-rum/cover'),
    rating: 4.8,
    budget: 40,
    location: pt(36.5836, 29.5756),
    isPublished: true,
    detail: {
      overview: {
        text: 'Wadi Rum is a UNESCO World Heritage Site offering jeep tours, camel treks, rock climbing, and unforgettable stargazing.',
        locationText: 'Aqaba Governorate, southern Jordan',
        recommendedStay: '1–2 nights',
        bestSeason: 'October–April',
        averageCost: '40–120 JOD per day',
      },
      activities: [
        { name: 'Jeep Desert Safari' },
        { name: 'Camel Trek' },
        { name: 'Stargazing Camp' },
        { name: 'Rock Climbing & Scrambling' },
        { name: 'Hot Air Balloon Ride' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Take the Desert Highway from Amman (approx. 4 hours) to Wadi Rum village; minibuses from Aqaba are also available.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Autumn through spring for tolerable temperatures. Avoid mid-summer when heat exceeds 40 °C.', sortOrder: 2 },
        { title: 'What to bring', content: 'Warm layers for cold desert nights, sunscreen, a scarf for wind/sand, and a good camera.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Lawrence\'s Spring', customOverview: 'A natural spring once used by T.E. Lawrence with Nabataean inscriptions carved into nearby rocks.', budget: '0', location: pt(36.5712, 29.5941), coverImage: img('wadi-rum/lawrence-spring') },
      { name: 'Khazali Canyon', customOverview: 'A narrow gorge with a 100-metre crack adorned with ancient Thamudic and Nabataean petroglyphs.', budget: '0', location: pt(36.5958, 29.5538), coverImage: img('wadi-rum/khazali') },
      { name: 'Burdah Rock Bridge', customOverview: 'One of the highest natural rock arches in Wadi Rum at 35 metres, a rewarding 2-hour climb.', budget: '0', location: pt(36.6209, 29.5308), coverImage: img('wadi-rum/burdah-bridge') },
    ],
    restaurants: [
      { name: 'Rum Stars Camp Restaurant', customOverview: 'Traditional Bedouin zarb (underground BBQ) and mezze served under a star-filled sky.', budget: '15–25 JOD', coverImage: img('wadi-rum/rum-stars-restaurant') },
      { name: 'Wadi Rum Night Luxury Camp Dining', customOverview: 'Candlelit dinner inside a traditional Bedouin tent with locally sourced lamb and rice dishes.', budget: '25–40 JOD', coverImage: img('wadi-rum/luxury-camp-dining') },
      { name: 'Rest House Restaurant', customOverview: 'Casual eatery at the visitor centre offering sandwiches, Bedouin tea, and light snacks.', budget: '5–12 JOD', coverImage: img('wadi-rum/rest-house') },
    ],
    hotels: [
      { name: 'Wadi Rum Night Luxury Camp', customOverview: 'Bubble tents and luxury Martian domes with transparent roofs for stargazing in style.', budget: '150–300 JOD', bookingUrl: 'https://wadirum-night.com', coverImage: img('wadi-rum/luxury-camp') },
      { name: 'Memories Aicha Bedouin Camp', customOverview: 'Authentic Bedouin camp with traditional goat-hair tents, campfire, and jeep tours.', budget: '40–70 JOD', bookingUrl: '', coverImage: img('wadi-rum/aicha-camp') },
      { name: 'Sun City Camp', customOverview: 'Mid-range desert camp with comfortable tents, live music, and excellent zarb BBQ dinners.', budget: '55–90 JOD', bookingUrl: '', coverImage: img('wadi-rum/sun-city') },
    ],
    event: {
      name: 'Wadi Rum Desert Marathon',
      customOverview: 'An annual ultra-marathon through the spectacular desert landscape, open to runners of all levels.',
      startDate: new Date('2025-10-15'),
      endDate: new Date('2025-10-17'),
      startTime: '07:00',
      endTime: '18:00',
      startingFromPrice: '85 JOD',
      durationText: '3 days',
      coverImage: img('wadi-rum/marathon'),
      isPublished: true,
    },
    quest: {
      title: 'وادي القمر',
      title_en: 'Valley of the Moon',
      description: 'اشهد غروب الشمس من أعلى كثيب رملي وصوّر السماء المرصّعة بالنجوم.',
      description_en: 'Watch the sunset from the top of a sand dune and photograph the star-filled night sky.',
      bonus_xp: 450,
      title_reward: 'Desert Wanderer',
      badge_url: img('badges/wadi-rum'),
      icon_url: img('icons/wadi-rum'),
      start_coordinates: { lat: 29.5756, lng: 36.5836 },
      ai_requirement: 'Upload a photo of the Wadi Rum landscape at sunset and describe the colors you see in the sky.',
    },
    badge: {
      title: 'ابن الصحراء',
      title_en: 'Child of the Desert',
      icon_url: img('badges/wadi-rum'),
      is_rare: false,
    },
  },

  // 3 ── DEAD SEA
  {
    name: 'Dead Sea',
    slug: 'dead-sea',
    tagline: 'The Lowest Point on Earth',
    description: 'The saltiest body of water on Earth at 430m below sea level, famous for therapeutic mud, effortless floating, and luxurious spa resorts.',
    image: img('dead-sea/cover'),
    rating: 4.7,
    budget: 60,
    location: pt(35.5561, 31.5590),
    isPublished: true,
    detail: {
      overview: {
        text: 'The Dead Sea\'s hyper-saline waters and mineral-rich black mud have attracted health-seekers for millennia.',
        locationText: 'Balqa Governorate, western Jordan',
        recommendedStay: '1–2 days',
        bestSeason: 'Year-round; avoid summer afternoons',
        averageCost: '30–200 JOD per day',
      },
      activities: [
        { name: 'Float in the Dead Sea' },
        { name: 'Dead Sea Mud Therapy' },
        { name: 'Spa & Wellness Treatments' },
        { name: 'Sunrise yoga on the shore' },
        { name: 'Scenic drive along the Dead Sea Highway' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'About 55 km southwest of Amman via the Dead Sea Road. Taxis and shared minibuses are available.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'October–April for comfortable weather. Early mornings are best in summer to beat the heat.', sortOrder: 2 },
        { title: 'What to bring', content: 'Old swimwear (salt ruins fabric), water shoes for rocky shores, sunglasses, and plenty of fresh water.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Dead Sea Public Beach', customOverview: 'Accessible stretch of shoreline where visitors can float in the famous hyper-saline waters.', budget: '5 JOD', location: pt(35.5503, 31.5463), coverImage: img('dead-sea/public-beach') },
      { name: 'Dead Sea Museum', customOverview: 'An interactive museum at the Lowest Point on Earth sign covering geology and history of the Dead Sea.', budget: '3 JOD', location: pt(35.5580, 31.5600), coverImage: img('dead-sea/museum') },
      { name: 'Wadi Zarqa Ma\'in Hot Springs', customOverview: 'Natural thermal waterfalls cascading into pools, just 30 minutes from the Dead Sea.', budget: '10 JOD', location: pt(35.5919, 31.5208), coverImage: img('dead-sea/hot-springs') },
    ],
    restaurants: [
      { name: 'Bait Al Sukkari', customOverview: 'Upscale Jordanian cuisine with live cooking stations and a breathtaking Dead Sea panorama.', budget: '25–45 JOD', coverImage: img('dead-sea/bait-al-sukkari') },
      { name: 'Saraya Restaurant – Movenpick', customOverview: 'International buffet with an extensive seafood section and dessert spread inside the Mövenpick resort.', budget: '30–50 JOD', coverImage: img('dead-sea/saraya') },
      { name: 'Panorama Dead Sea Restaurant', customOverview: 'Casual poolside dining with mezze, grills, and fresh juices overlooking the salt sea.', budget: '12–22 JOD', coverImage: img('dead-sea/panorama') },
    ],
    hotels: [
      { name: 'Kempinski Hotel Ishtar Dead Sea', customOverview: 'Ultra-luxurious 5-star resort with a cascading infinity pool, private beach, and world-class spa.', budget: '200–400 JOD', bookingUrl: 'https://kempinski.com/dead-sea', coverImage: img('dead-sea/kempinski') },
      { name: 'Mövenpick Resort & Spa Dead Sea', customOverview: 'Award-winning beachfront resort with extensive spa facilities and stunning salt-sea views.', budget: '150–280 JOD', bookingUrl: '', coverImage: img('dead-sea/movenpick') },
      { name: 'Holiday Inn Resort Dead Sea', customOverview: 'Family-friendly 4-star resort with private beach, multiple pools, and good kids\' club.', budget: '90–150 JOD', bookingUrl: '', coverImage: img('dead-sea/holiday-inn') },
    ],
    event: {
      name: 'Dead Sea Ultra Marathon',
      customOverview: 'A uniquely challenging race from the Dead Sea shore, the lowest point on Earth, ascending through dramatic desert terrain.',
      startDate: new Date('2025-04-04'),
      endDate: new Date('2025-04-05'),
      startTime: '06:00',
      endTime: '20:00',
      startingFromPrice: '75 JOD',
      durationText: '2 days',
      coverImage: img('dead-sea/marathon'),
      isPublished: true,
    },
    quest: {
      title: 'أعمق نقطة على الأرض',
      title_en: 'Deepest Point on Earth',
      description: 'اطفُ على سطح البحر الميت وطبّق الطين العلاجي على جسمك.',
      description_en: 'Float effortlessly on the Dead Sea surface and apply therapeutic mineral mud to your skin.',
      bonus_xp: 350,
      title_reward: 'Salt & Soul',
      badge_url: img('badges/dead-sea'),
      icon_url: img('icons/dead-sea'),
      start_coordinates: { lat: 31.5590, lng: 35.5561 },
      ai_requirement: 'Take a photo of yourself floating in the Dead Sea holding a newspaper or book, then share what you read!',
    },
    badge: {
      title: 'طافي البحر الميت',
      title_en: 'Dead Sea Floater',
      icon_url: img('badges/dead-sea'),
      is_rare: false,
    },
  },

  // 4 ── JERASH
  {
    name: 'Jerash',
    slug: 'jerash',
    tagline: 'The Pompeii of the East',
    description: 'One of the best-preserved Greco-Roman cities outside Italy, with colonnaded streets, grand temples, and a massive oval plaza.',
    image: img('jerash/cover'),
    rating: 4.7,
    budget: 20,
    location: pt(35.8911, 32.2810),
    isPublished: true,
    detail: {
      overview: {
        text: 'Jerash (ancient Gerasa) boasts remarkably intact Roman ruins including the Oval Plaza, Cardo Maximus, and Hadrian\'s Arch.',
        locationText: 'Jerash Governorate, northern Jordan',
        recommendedStay: 'Half day to 1 day',
        bestSeason: 'Spring and Autumn',
        averageCost: '10–30 JOD per day',
      },
      activities: [
        { name: 'Walk the Cardo Maximus (Colonnaded Street)' },
        { name: 'Watch Roman Soldier reenactments' },
        { name: 'Attend the Jerash Festival' },
        { name: 'Visit the Temple of Artemis' },
        { name: 'Explore the North Theatre' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Only 48 km north of Amman; buses and service taxis run regularly from Tabarbour station.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring (March–May) for wildflowers among the ruins; October for the Jerash Festival of Culture and Arts.', sortOrder: 2 },
        { title: 'What to bring', content: 'Comfortable walking shoes, a hat, sunscreen, and a guidebook or audio guide app.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Oval Plaza (Forum)', customOverview: 'A unique elliptical colonnaded plaza 80×90 metres, the defining symbol of ancient Gerasa.', budget: '0', location: pt(35.8897, 32.2801), coverImage: img('jerash/oval-plaza') },
      { name: 'Temple of Artemis', customOverview: 'Dedicated to the patron goddess of Gerasa, this 2nd-century temple has 11 standing Corinthian columns.', budget: '0', location: pt(35.8885, 32.2834), coverImage: img('jerash/artemis-temple') },
      { name: 'Hadrian\'s Arch', customOverview: 'A triumphal arch built in 129 AD to commemorate the visit of Emperor Hadrian, standing 21 metres tall.', budget: '0', location: pt(35.8906, 32.2769), coverImage: img('jerash/hadrian-arch') },
    ],
    restaurants: [
      { name: 'Lebanese House Restaurant', customOverview: 'Generous mezze spreads and grilled meats in a garden setting near the ruins.', budget: '10–20 JOD', coverImage: img('jerash/lebanese-house') },
      { name: 'Jerash Rest House', customOverview: 'Convenient on-site café with light bites, tea, and cold drinks right at the archaeological park entrance.', budget: '4–10 JOD', coverImage: img('jerash/rest-house') },
      { name: 'Olive Branch Restaurant', customOverview: 'Homestyle Jordanian cooking with mansaf and musakhan in a cosy stone-walled dining room.', budget: '8–15 JOD', coverImage: img('jerash/olive-branch') },
    ],
    hotels: [
      { name: 'Jerash Hotel', customOverview: 'Comfortable mid-range hotel in the town centre with easy access to the ruins and friendly staff.', budget: '40–65 JOD', bookingUrl: '', coverImage: img('jerash/jerash-hotel') },
      { name: 'Olive Branch Hotel', customOverview: 'Charming countryside hotel set amid olive groves, 10 minutes from the Jerash ruins.', budget: '55–80 JOD', bookingUrl: '', coverImage: img('jerash/olive-branch-hotel') },
      { name: 'Hadrian Gate Hotel', customOverview: 'Budget-friendly guesthouse steps from Hadrian\'s Arch with rooftop views of the ancient city.', budget: '25–40 JOD', bookingUrl: '', coverImage: img('jerash/hadrian-gate-hotel') },
    ],
    event: {
      name: 'Jerash Festival of Culture and Arts',
      customOverview: 'Jordan\'s premier cultural festival held annually among the Roman ruins, featuring theatre, music, and folklore from across the Arab world.',
      startDate: new Date('2025-07-20'),
      endDate: new Date('2025-08-05'),
      startTime: '18:00',
      endTime: '23:00',
      startingFromPrice: '10 JOD',
      durationText: '16 days',
      coverImage: img('jerash/festival'),
      isPublished: true,
    },
    quest: {
      title: 'بومبي الشرق',
      title_en: 'Pompeii of the East',
      description: 'استكشف الشارع المعمود والبلازا البيضاوية وقوس هادريان في مدينة جرش الرومانية.',
      description_en: 'Navigate the Cardo Maximus, the Oval Plaza, and Hadrian\'s Arch in the ancient Roman city of Gerasa.',
      bonus_xp: 350,
      title_reward: 'Citizen of Gerasa',
      badge_url: img('badges/jerash'),
      icon_url: img('icons/jerash'),
      start_coordinates: { lat: 32.2810, lng: 35.8911 },
      ai_requirement: 'Find a column still standing in the Cardo Maximus and describe what daily Roman life might have looked like on this street.',
    },
    badge: {
      title: 'مواطن جيراسا',
      title_en: 'Citizen of Gerasa',
      icon_url: img('badges/jerash'),
      is_rare: false,
    },
  },

  // 5 ── AMMAN
  {
    name: 'Amman',
    slug: 'amman',
    tagline: 'The White City',
    description: 'Jordan\'s vibrant capital built on seven hills, blending ancient Roman ruins with a thriving café culture, world-class restaurants, and buzzing souks.',
    image: img('amman/cover'),
    rating: 4.6,
    budget: 35,
    location: pt(35.9106, 31.9544),
    isPublished: true,
    detail: {
      overview: {
        text: 'Amman is a city of contrasts — ancient citadels overlooking modern art galleries, traditional mansaf beside trendy rooftop bars.',
        locationText: 'Amman Governorate, central Jordan',
        recommendedStay: '2–3 days',
        bestSeason: 'Spring (March–May) and Autumn (Sept–Nov)',
        averageCost: '30–100 JOD per day',
      },
      activities: [
        { name: 'Explore the Citadel (Jabal Al-Qal\'a)' },
        { name: 'Wander through Downtown Amman Souks' },
        { name: 'Visit the Jordan Museum' },
        { name: 'Street food tour in Lweibdeh' },
        { name: 'Shop Rainbow Street' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Queen Alia International Airport is 35 km south; airport buses, taxis, and ride-share apps are readily available.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring and autumn are ideal. Summers are hot but manageable; winters can be cold with occasional snow.', sortOrder: 2 },
        { title: 'What to bring', content: 'Layers for cool evenings, comfortable shoes for hilly streets, and an appetite for street food.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Amman Citadel (Jabal Al-Qal\'a)', customOverview: 'An ancient hilltop complex with the Temple of Hercules, the Umayyad Palace, and sweeping city views.', budget: '3 JOD', location: pt(35.9301, 31.9552), coverImage: img('amman/citadel') },
      { name: 'Roman Theatre', customOverview: 'A magnificently preserved 6,000-seat Roman theatre built in the 2nd century AD in downtown Amman.', budget: '3 JOD', location: pt(35.9310, 31.9520), coverImage: img('amman/roman-theatre') },
      { name: 'Jordan Museum', customOverview: 'Jordan\'s flagship museum housing the Dead Sea Scrolls, Ain Ghazal statues, and 10,000 years of history.', budget: '5 JOD', location: pt(35.9177, 31.9503), coverImage: img('amman/jordan-museum') },
    ],
    restaurants: [
      { name: 'Sufra Restaurant', customOverview: 'Award-winning Jordanian heritage cuisine served in a beautifully restored 1940s villa in Rainbow Street.', budget: '20–40 JOD', coverImage: img('amman/sufra') },
      { name: 'Hashem Restaurant', customOverview: 'Amman\'s most legendary falafel and hummus joint — a downtown institution open since 1952.', budget: '2–5 JOD', coverImage: img('amman/hashem') },
      { name: 'Tawaheen Al Hawa', customOverview: 'Romantic rooftop restaurant with panoramic city views, serving fine Jordanian and Levantine cuisine.', budget: '25–45 JOD', coverImage: img('amman/tawaheen') },
    ],
    hotels: [
      { name: 'Four Seasons Hotel Amman', customOverview: 'The pinnacle of Amman luxury, with stunning city views, rooftop pool, and impeccable service.', budget: '200–400 JOD', bookingUrl: 'https://fourseasons.com/amman', coverImage: img('amman/four-seasons') },
      { name: 'W Amman', customOverview: 'Stylish design hotel in the heart of the city with a buzzing rooftop bar and modern rooms.', budget: '130–220 JOD', bookingUrl: '', coverImage: img('amman/w-hotel') },
      { name: 'Hisham Hotel', customOverview: 'Classic 4-star hotel in Shmeisani offering comfort, a great breakfast, and central location.', budget: '55–90 JOD', bookingUrl: '', coverImage: img('amman/hisham') },
    ],
    event: {
      name: 'Amman Design Week',
      customOverview: 'An annual celebration of contemporary design, architecture, and creative culture across multiple venues in the capital.',
      startDate: new Date('2025-09-20'),
      endDate: new Date('2025-09-28'),
      startTime: '10:00',
      endTime: '22:00',
      startingFromPrice: '0 JOD',
      durationText: '8 days',
      coverImage: img('amman/design-week'),
      isPublished: true,
    },
    quest: {
      title: 'المدينة البيضاء',
      title_en: 'The White City',
      description: 'استكشف قلعة عمان والمسرح الروماني وتذوّق أشهر فلافل هاشم في وسط البلد.',
      description_en: 'Explore the Amman Citadel and Roman Theatre, then taste the legendary falafel at Hashem Restaurant.',
      bonus_xp: 300,
      title_reward: 'Ammani at Heart',
      badge_url: img('badges/amman'),
      icon_url: img('icons/amman'),
      start_coordinates: { lat: 31.9544, lng: 35.9106 },
      ai_requirement: 'Take a photo from the top of the Citadel and name three landmarks you can spot on the Amman skyline.',
    },
    badge: {
      title: 'ابن عمّان',
      title_en: 'Son of Amman',
      icon_url: img('badges/amman'),
      is_rare: false,
    },
  },

  // 6 ── AQABA
  {
    name: 'Aqaba',
    slug: 'aqaba',
    tagline: 'Jordan\'s Window to the Sea',
    description: 'Jordan\'s only coastal city on the Red Sea, famed for world-class coral reefs, crystal-clear waters, and a relaxed beach-town atmosphere.',
    image: img('aqaba/cover'),
    rating: 4.6,
    budget: 45,
    location: pt(35.0036, 29.5321),
    isPublished: true,
    detail: {
      overview: {
        text: 'Aqaba offers some of the Middle East\'s finest diving and snorkelling, combined with a charming old town and Mamluk castle.',
        locationText: 'Aqaba Governorate, southern Jordan',
        recommendedStay: '2–4 days',
        bestSeason: 'October–April',
        averageCost: '40–150 JOD per day',
      },
      activities: [
        { name: 'Scuba Diving & Snorkelling' },
        { name: 'Glass-Bottom Boat Tour' },
        { name: 'Visit the Aqaba Fort (Mamluk Castle)' },
        { name: 'Kitesurfing at South Beach' },
        { name: 'Sunset Dhow Cruise' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'King Hussein International Airport serves Aqaba; JETT buses run from Amman (4 hours).', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Winter months are perfect for diving; summer is very hot but the sea is warm and calm.', sortOrder: 2 },
        { title: 'What to bring', content: 'Reef-safe sunscreen, snorkel gear (or rent locally), light clothing, and underwater camera.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Aqaba Fort (Mamluk Castle)', customOverview: 'A 16th-century Mamluk castle overlooking the Red Sea, once a key stop on the Hejaz pilgrimage route.', budget: '2 JOD', location: pt(35.0019, 29.5264), coverImage: img('aqaba/fort') },
      { name: 'Aqaba Marine Park', customOverview: 'A protected marine reserve with vibrant coral reefs, sea turtles, and hundreds of fish species.', budget: '5 JOD', location: pt(35.0153, 29.5128), coverImage: img('aqaba/marine-park') },
      { name: 'Berenice Beach Club', customOverview: 'Upscale beach club with sun loungers, water sports, and a swim-up bar on the Red Sea.', budget: '15 JOD', location: pt(35.0120, 29.5186), coverImage: img('aqaba/berenice') },
    ],
    restaurants: [
      { name: 'Floka Restaurant', customOverview: 'Aqaba\'s most beloved seafood restaurant serving ultra-fresh Red Sea fish and shrimp on a waterfront terrace.', budget: '15–30 JOD', coverImage: img('aqaba/floka') },
      { name: 'Ali Baba Restaurant', customOverview: 'Landmark fish restaurant in downtown Aqaba with generous grilled seafood platters and mezze.', budget: '10–20 JOD', coverImage: img('aqaba/ali-baba') },
      { name: 'Royal Yacht Club Restaurant', customOverview: 'Elegant marina-side dining with international menu and spectacular sunset views over the Red Sea.', budget: '25–50 JOD', coverImage: img('aqaba/royal-yacht') },
    ],
    hotels: [
      { name: 'InterContinental Aqaba Resort', customOverview: 'Landmark beachfront 5-star resort with a private beach, dive centre, and sprawling pool complex.', budget: '150–280 JOD', bookingUrl: '', coverImage: img('aqaba/intercontinental') },
      { name: 'Mövenpick Resort & Residences Aqaba', customOverview: 'Elegant resort with direct Red Sea beach access, multiple restaurants, and a full-service spa.', budget: '120–220 JOD', bookingUrl: '', coverImage: img('aqaba/movenpick') },
      { name: 'Saraya Aqaba Lagoon Hotel', customOverview: 'Unique lagoon-side hotel with floating villas and excellent value for families and couples alike.', budget: '70–130 JOD', bookingUrl: '', coverImage: img('aqaba/saraya') },
    ],
    event: {
      name: 'Aqaba Traditional Arts Festival',
      customOverview: 'A vibrant waterfront celebration of Jordanian folk music, crafts, and traditional cuisine along the Red Sea corniche.',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-07'),
      startTime: '17:00',
      endTime: '23:00',
      startingFromPrice: '0 JOD',
      durationText: '7 days',
      coverImage: img('aqaba/arts-festival'),
      isPublished: true,
    },
    quest: {
      title: 'شعاب البحر الأحمر',
      title_en: 'Red Sea Reefs',
      description: 'اغطس في الحيد المرجانية واكتشف ثروات البحر الأحمر في عقبة.',
      description_en: 'Dive into the coral reefs and discover the treasures of the Red Sea in Aqaba.',
      bonus_xp: 400,
      title_reward: 'Coral Keeper',
      badge_url: img('badges/aqaba'),
      icon_url: img('icons/aqaba'),
      start_coordinates: { lat: 29.5321, lng: 35.0036 },
      ai_requirement: 'Photograph a coral formation underwater and identify at least one species of fish you spotted.',
    },
    badge: {
      title: 'حارس الشعاب',
      title_en: 'Reef Guardian',
      icon_url: img('badges/aqaba'),
      is_rare: true,
    },
  },

  // 7 ── WADI MUJIB
  {
    name: 'Wadi Mujib',
    slug: 'wadi-mujib',
    tagline: 'The Grand Canyon of Jordan',
    description: 'A dramatic gorge cutting through sandstone cliffs into the Dead Sea, home to Jordan\'s first nature reserve and thrilling water adventures.',
    image: img('wadi-mujib/cover'),
    rating: 4.7,
    budget: 25,
    location: pt(35.6100, 31.4672),
    isPublished: true,
    detail: {
      overview: {
        text: 'Wadi Mujib Biosphere Reserve offers canyoning, rock climbing, and wild swimming through narrow gorges.',
        locationText: 'Madaba Governorate, western Jordan',
        recommendedStay: '1 day',
        bestSeason: 'April–October (trails open April 1)',
        averageCost: '20–50 JOD per day',
      },
      activities: [
        { name: 'Siq Trail (wading gorge walk)' },
        { name: 'Waterfall Trail' },
        { name: 'Canyon Rappelling' },
        { name: 'Rock Climbing' },
        { name: 'Wildlife spotting (Nubian ibex, eagles)' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Drive south from Amman on the Dead Sea Road (about 90 minutes); look for the RSCN Mujib Chalet signs.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Trails are open April–October. Best in spring when wildflowers bloom and water levels are manageable.', sortOrder: 2 },
        { title: 'What to bring', content: 'Water shoes (mandatory), swimwear, dry bag for valuables, and a change of clothes — you WILL get wet.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Siq Trail Gorge', customOverview: 'The signature trail: a 2 km wading adventure through a narrow water-filled canyon ending at a waterfall.', budget: '21 JOD', location: pt(35.6088, 31.4680), coverImage: img('wadi-mujib/siq-trail') },
      { name: 'Mujib Waterfall', customOverview: 'A stunning natural waterfall at the end of the Siq Trail, perfect for swimming and cliff jumping.', budget: '0', location: pt(35.6070, 31.4690), coverImage: img('wadi-mujib/waterfall') },
      { name: 'Nubian Ibex Viewpoint', customOverview: 'A rocky promontory above the canyon where you can often spot wild Nubian ibex on the clifftops.', budget: '0', location: pt(35.6120, 31.4660), coverImage: img('wadi-mujib/ibex-viewpoint') },
    ],
    restaurants: [
      { name: 'Mujib Chalet Restaurant', customOverview: 'The RSCN-run lakeside restaurant serving hot meals and snacks right at the trailhead on the Dead Sea shore.', budget: '8–18 JOD', coverImage: img('wadi-mujib/chalet-restaurant') },
      { name: 'Dead Sea Panorama Restaurant', customOverview: 'Nearby restaurant atop the canyon rim with breathtaking Dead Sea views and full Jordanian menu.', budget: '15–30 JOD', coverImage: img('wadi-mujib/panorama') },
      { name: 'Hammamat Ma\'in Cafeteria', customOverview: 'Casual café near the Ma\'in Hot Springs serving snacks, tea, and cold drinks for weary hikers.', budget: '4–10 JOD', coverImage: img('wadi-mujib/mujib-cafeteria') },
    ],
    hotels: [
      { name: 'Mujib Chalet (RSCN)', customOverview: 'Eco-friendly chalets perched on the Dead Sea shore run by the Royal Society for the Conservation of Nature.', budget: '80–120 JOD', bookingUrl: 'https://rscn.org.jo', coverImage: img('wadi-mujib/chalet') },
      { name: 'Hammamat Ma\'in Hotel & Spa', customOverview: 'Thermal spa resort 30 minutes away with natural hot springs, pools, and comfortable rooms.', budget: '90–160 JOD', bookingUrl: '', coverImage: img('wadi-mujib/mamin-hotel') },
      { name: 'Holiday Inn Dead Sea', customOverview: 'Family-friendly resort just 15 minutes north, a convenient base for Wadi Mujib adventures.', budget: '90–150 JOD', bookingUrl: '', coverImage: img('wadi-mujib/holiday-inn') },
    ],
    event: {
      name: 'Wadi Mujib Canyoning Challenge',
      customOverview: 'A guided canyoning competition through Wadi Mujib\'s gorges, testing speed, teamwork, and adventure spirit.',
      startDate: new Date('2025-05-10'),
      endDate: new Date('2025-05-10'),
      startTime: '08:00',
      endTime: '16:00',
      startingFromPrice: '30 JOD',
      durationText: '8 hours',
      coverImage: img('wadi-mujib/canyoning-event'),
      isPublished: true,
    },
    quest: {
      title: 'الوادي الغامض',
      title_en: 'The Mysterious Gorge',
      description: 'اشقّ طريقك عبر مضيق وادي موجب المائي واصل إلى الشلال في نهايته.',
      description_en: 'Wade through the water-filled Siq gorge of Wadi Mujib and reach the waterfall at its end.',
      bonus_xp: 420,
      title_reward: 'Canyon Conqueror',
      badge_url: img('badges/wadi-mujib'),
      icon_url: img('icons/wadi-mujib'),
      start_coordinates: { lat: 31.4672, lng: 35.6100 },
      ai_requirement: 'Film a 15-second video of your trail walk through the gorge and describe the sounds you hear.',
    },
    badge: {
      title: 'فاتح الوادي',
      title_en: 'Gorge Conqueror',
      icon_url: img('badges/wadi-mujib'),
      is_rare: false,
    },
  },

  // 8 ── MOUNT NEBO
  {
    name: 'Mount Nebo',
    slug: 'mount-nebo',
    tagline: 'Where Moses Saw the Promised Land',
    description: 'The hilltop where Moses viewed Canaan before his death, now a pilgrimage site with a famous Byzantine church and sweeping views over the Jordan Valley.',
    image: img('mount-nebo/cover'),
    rating: 4.5,
    budget: 10,
    location: pt(35.7286, 31.7678),
    isPublished: true,
    detail: {
      overview: {
        text: 'Mount Nebo features the Moses Memorial Church with stunning Byzantine mosaics, the Brazen Serpent sculpture, and panoramic Holy Land views.',
        locationText: 'Madaba Governorate, central-western Jordan',
        recommendedStay: 'Half day',
        bestSeason: 'Year-round; clearest views in winter',
        averageCost: '5–20 JOD per day',
      },
      activities: [
        { name: 'Visit the Moses Memorial Church' },
        { name: 'View Byzantine floor mosaics' },
        { name: 'Photograph the Brazen Serpent sculpture' },
        { name: 'Watch the sunset over the Jordan Valley' },
        { name: 'Walk the pilgrimage garden trail' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'About 10 km west of Madaba; easily combined with a Madaba day trip from Amman (1 hour drive).', sortOrder: 1 },
        { title: 'Best time to visit', content: 'On a clear winter day you can see Jerusalem, Bethlehem, and even the Mediterranean. Spring is also beautiful.', sortOrder: 2 },
        { title: 'What to bring', content: 'Modest clothing (it is an active religious site), binoculars for the views, and a camera.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Moses Memorial Church', customOverview: 'A 4th-century Byzantine basilica rebuilt multiple times, containing superb floor mosaics depicting hunting and pastoral scenes.', budget: '3 JOD', location: pt(35.7282, 31.7681), coverImage: img('mount-nebo/moses-church') },
      { name: 'Brazen Serpent Monument', customOverview: 'A contemporary bronze sculpture by Italian artist Giovanni Fantoni, symbolising Moses\'s serpent staff and the Cross.', budget: '0', location: pt(35.7288, 31.7679), coverImage: img('mount-nebo/serpent-monument') },
      { name: 'Jordan Valley Viewpoint', customOverview: 'A panoramic terrace with signage pointing to Jericho, Jerusalem, the Dead Sea, and Bethlehem across the valley.', budget: '0', location: pt(35.7284, 31.7675), coverImage: img('mount-nebo/viewpoint') },
    ],
    restaurants: [
      { name: 'Nebo Restaurant', customOverview: 'Simple but good Jordanian buffet near the church entrance, popular with pilgrimage groups.', budget: '8–15 JOD', coverImage: img('mount-nebo/nebo-restaurant') },
      { name: 'Madaba Kitchen', customOverview: 'A short drive into Madaba for authentic home-style Jordanian food and fresh-baked bread.', budget: '6–12 JOD', coverImage: img('mount-nebo/madaba-kitchen') },
      { name: 'Haret Jdoudna', customOverview: 'Beloved Madaba institution in a restored 19th-century house, serving superb mansaf and mezze.', budget: '15–30 JOD', coverImage: img('mount-nebo/haret-jdoudna') },
    ],
    hotels: [
      { name: 'Mosaic City Hotel – Madaba', customOverview: 'Central Madaba hotel with mosaic-themed décor, rooftop views, and friendly staff — ideal Nebo base.', budget: '40–65 JOD', bookingUrl: '', coverImage: img('mount-nebo/mosaic-city-hotel') },
      { name: 'Mariam Hotel – Madaba', customOverview: 'Comfortable 3-star hotel within walking distance of St George\'s Church and local restaurants.', budget: '35–55 JOD', bookingUrl: '', coverImage: img('mount-nebo/mariam-hotel') },
      { name: 'Dead Sea Spa Hotel', customOverview: 'Spa resort 30 minutes away, convenient for combining Mount Nebo with a Dead Sea day.', budget: '80–130 JOD', bookingUrl: '', coverImage: img('mount-nebo/dead-sea-spa') },
    ],
    event: {
      name: 'International Pilgrimage Walk to Mount Nebo',
      customOverview: 'An annual interfaith pilgrimage walk from Madaba to Mount Nebo attracting thousands of pilgrims from around the world.',
      startDate: new Date('2025-03-20'),
      endDate: new Date('2025-03-20'),
      startTime: '07:00',
      endTime: '13:00',
      startingFromPrice: '0 JOD',
      durationText: '6 hours',
      coverImage: img('mount-nebo/pilgrimage'),
      isPublished: true,
    },
    quest: {
      title: 'جبل النبي موسى',
      title_en: 'Mountain of the Prophet Moses',
      description: 'قف على الجبل حيث رأى موسى الأرض الموعودة وشاهد غروب الشمس فوق وادي الأردن.',
      description_en: 'Stand where Moses gazed upon the Promised Land and watch the sun set over the Jordan Valley.',
      bonus_xp: 280,
      title_reward: 'Pilgrim of the Heights',
      badge_url: img('badges/mount-nebo'),
      icon_url: img('icons/mount-nebo'),
      start_coordinates: { lat: 31.7678, lng: 35.7286 },
      ai_requirement: 'Photograph the view from Mount Nebo and identify at least two geographic features visible in the Jordan Valley below.',
    },
    badge: {
      title: 'حاج الجبل',
      title_en: 'Mountain Pilgrim',
      icon_url: img('badges/mount-nebo'),
      is_rare: false,
    },
  },

  // 9 ── MADABA
  {
    name: 'Madaba',
    slug: 'madaba',
    tagline: 'City of Mosaics',
    description: 'The "City of Mosaics" is home to the oldest surviving cartographic depiction of the Holy Land — a stunning 6th-century Byzantine mosaic floor map.',
    image: img('madaba/cover'),
    rating: 4.5,
    budget: 15,
    location: pt(35.7939, 31.7167),
    isPublished: true,
    detail: {
      overview: {
        text: 'Madaba\'s St George\'s Church houses the famous Madaba Map, and the town is filled with Byzantine churches, Ottoman mansions, and mosaic workshops.',
        locationText: 'Madaba Governorate, central Jordan',
        recommendedStay: 'Half day to 1 day',
        bestSeason: 'Year-round',
        averageCost: '10–30 JOD per day',
      },
      activities: [
        { name: 'Visit the Madaba Mosaic Map' },
        { name: 'Tour the Archaeological Museum' },
        { name: 'Watch artisans in mosaic workshops' },
        { name: 'Explore the Church of the Apostles' },
        { name: 'Stroll the old Ottoman souk' },
      ],
      guideSections: [
        { title: 'How to get there', content: '30 km south of Amman; frequent minibuses from Wihdat station or direct taxi.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Comfortable year-round; combine with Mount Nebo and Dead Sea in a single day trip from Amman.', sortOrder: 2 },
        { title: 'What to bring', content: 'Modest clothing for churches, camera, and cash to buy a mosaic souvenir from local workshops.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'St George\'s Greek Orthodox Church', customOverview: 'Home to the world-famous Madaba Map — a 6th-century Byzantine mosaic floor map of the Holy Land.', budget: '2 JOD', location: pt(35.7941, 31.7160), coverImage: img('madaba/st-george') },
      { name: 'Church of the Apostles', customOverview: 'A Byzantine church featuring a magnificent central mosaic of the sea goddess Thalassa, dating to 568 AD.', budget: '2 JOD', location: pt(35.7952, 31.7155), coverImage: img('madaba/apostles-church') },
      { name: 'Madaba Mosaic School', customOverview: 'A living school where artisans create traditional Byzantine mosaics; visitors can watch and buy original pieces.', budget: '0', location: pt(35.7935, 31.7170), coverImage: img('madaba/mosaic-school') },
    ],
    restaurants: [
      { name: 'Haret Jdoudna', customOverview: 'Set in a restored 19th-century family home, serving the finest mansaf and traditional Jordanian dishes in Madaba.', budget: '15–30 JOD', coverImage: img('madaba/haret-jdoudna') },
      { name: 'Adonis Restaurant', customOverview: 'Friendly family restaurant near St George\'s Church serving classic Jordanian and Lebanese cuisine.', budget: '8–15 JOD', coverImage: img('madaba/adonis') },
      { name: 'Ayola Café & Restaurant', customOverview: 'Cosy rooftop café with city views, excellent coffee, and a good selection of light meals and pastries.', budget: '5–12 JOD', coverImage: img('madaba/ayola') },
    ],
    hotels: [
      { name: 'Mosaic City Hotel', customOverview: 'The top choice in Madaba — mosaic-decorated rooms, superb rooftop, and knowledgeable local staff.', budget: '40–65 JOD', bookingUrl: '', coverImage: img('madaba/mosaic-city') },
      { name: 'Mariam Hotel', customOverview: 'Reliable 3-star in the heart of Madaba with a good breakfast and central location.', budget: '35–55 JOD', bookingUrl: '', coverImage: img('madaba/mariam-hotel') },
      { name: 'Black Iris Hotel', customOverview: 'Boutique guesthouse with individually decorated rooms featuring traditional Jordanian design elements.', budget: '28–45 JOD', bookingUrl: '', coverImage: img('madaba/black-iris') },
    ],
    event: {
      name: 'Madaba Mosaic Festival',
      customOverview: 'An annual celebration of Byzantine and contemporary mosaic art with live demonstrations, competitions, and an open-air exhibition.',
      startDate: new Date('2025-06-05'),
      endDate: new Date('2025-06-10'),
      startTime: '10:00',
      endTime: '21:00',
      startingFromPrice: '0 JOD',
      durationText: '6 days',
      coverImage: img('madaba/mosaic-festival'),
      isPublished: true,
    },
    quest: {
      title: 'مدينة الفسيفساء',
      title_en: 'City of Mosaics',
      description: 'اكتشف خريطة مادبا الفسيفسائية واتبع آثار الفنانين البيزنطيين في شوارع المدينة.',
      description_en: 'Discover the Madaba Mosaic Map and follow the trail of Byzantine artisans through the city\'s streets.',
      bonus_xp: 280,
      title_reward: 'Mosaic Seeker',
      badge_url: img('badges/madaba'),
      icon_url: img('icons/madaba'),
      start_coordinates: { lat: 31.7167, lng: 35.7939 },
      ai_requirement: 'Find Jerusalem on the Madaba Map and describe what other cities and landmarks are depicted around it.',
    },
    badge: {
      title: 'صانع الفسيفساء',
      title_en: 'Mosaic Maker',
      icon_url: img('badges/madaba'),
      is_rare: false,
    },
  },

  // 10 ── DANA RESERVE
  {
    name: 'Dana Biosphere Reserve',
    slug: 'dana-reserve',
    tagline: 'Jordan\'s Largest Nature Reserve',
    description: 'A stunning patchwork of ecosystems from sandstone mountains to sandy desert, home to rare wildlife and ancient copper mining villages.',
    image: img('dana/cover'),
    rating: 4.8,
    budget: 30,
    location: pt(35.6069, 30.6875),
    isPublished: true,
    detail: {
      overview: {
        text: 'Dana spans four bio-geographical zones and is home to over 800 plant species, 215 bird species, and 37 mammal species including wolves and leopards.',
        locationText: 'Tafilah Governorate, southern Jordan',
        recommendedStay: '1–3 days',
        bestSeason: 'Spring and Autumn',
        averageCost: '25–80 JOD per day',
      },
      activities: [
        { name: 'Wadi Dana Trek (15 km to Feynan)' },
        { name: 'Birdwatching' },
        { name: 'Visit the Ottoman-era Dana Village' },
        { name: 'Night sky stargazing' },
        { name: 'Copper smelting site tour (Khirbet Feynan)' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'Drive south from Amman on the King\'s Highway (approx. 3 hours) to Dana village; follow RSCN signs.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring for wildflowers and migratory birds; autumn for comfortable trekking temperatures.', sortOrder: 2 },
        { title: 'What to bring', content: 'Sturdy hiking boots, layers (temperatures vary dramatically), binoculars, water, and a trail map from RSCN.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Dana Village', customOverview: 'A beautifully preserved Ottoman-era stone village perched on the cliff edge above Wadi Dana.', budget: '0', location: pt(35.6060, 30.6880), coverImage: img('dana/dana-village') },
      { name: 'Wadi Dana Trail', customOverview: 'A 15 km trek descending through four ecological zones from 1,500m elevation to the Wadi Araba rift valley.', budget: '10 JOD', location: pt(35.6080, 30.6870), coverImage: img('dana/wadi-trail') },
      { name: 'Feynan Ecolodge Viewpoint', customOverview: 'A remote candlelit ecolodge accessible only on foot, surrounded by ancient copper mines and ibex habitat.', budget: '0', location: pt(35.5800, 30.6510), coverImage: img('dana/feynan-viewpoint') },
    ],
    restaurants: [
      { name: 'Dana Tower Restaurant', customOverview: 'Clifftop restaurant at the Dana Tower Hotel serving hearty Jordanian food with canyon panoramas.', budget: '8–18 JOD', coverImage: img('dana/tower-restaurant') },
      { name: 'Rummana Camp Dining', customOverview: 'RSCN-operated camp kitchen serving wholesome meals for hikers in season (April–October).', budget: '10–20 JOD', coverImage: img('dana/rummana-dining') },
      { name: 'Feynan Ecolodge Communal Kitchen', customOverview: 'Simple, solar-powered communal meals with local vegetables and lamb prepared by Dana community members.', budget: '15 JOD', coverImage: img('dana/feynan-kitchen') },
    ],
    hotels: [
      { name: 'Feynan Ecolodge', customOverview: 'National Geographic\'s top eco-lodge in the Middle East — solar-powered, candlelit, and breathtakingly remote.', budget: '100–160 JOD', bookingUrl: 'https://ecohotels.me/feynan', coverImage: img('dana/feynan-lodge') },
      { name: 'Dana Tower Hotel', customOverview: 'Charming stone guesthouse in Dana village with terrace views over the wadi and good home cooking.', budget: '35–60 JOD', bookingUrl: '', coverImage: img('dana/tower-hotel') },
      { name: 'Rummana Campsite (RSCN)', customOverview: 'Eco-campsite inside the reserve open April–October, perfect for self-sufficient trekkers.', budget: '15–25 JOD', bookingUrl: 'https://rscn.org.jo', coverImage: img('dana/rummana-camp') },
    ],
    event: {
      name: 'Dana Nature Photography Workshop',
      customOverview: 'An annual guided photography workshop led by professional wildlife photographers through the stunning landscapes of the Dana Reserve.',
      startDate: new Date('2025-04-10'),
      endDate: new Date('2025-04-13'),
      startTime: '06:00',
      endTime: '19:00',
      startingFromPrice: '120 JOD',
      durationText: '4 days',
      coverImage: img('dana/photo-workshop'),
      isPublished: true,
    },
    quest: {
      title: 'أعماق الطبيعة',
      title_en: 'Into the Wild',
      description: 'اقطع وادي دانا كاملاً من القرية إلى لودج فينان المتاح بالمشي فقط.',
      description_en: 'Complete the full Wadi Dana trek from the village to the remote Feynan Ecolodge on foot.',
      bonus_xp: 500,
      title_reward: 'Wadi Dana Trekker',
      badge_url: img('badges/dana'),
      icon_url: img('icons/dana'),
      start_coordinates: { lat: 30.6875, lng: 35.6069 },
      ai_requirement: 'Spot and photograph a wild animal during your Dana trek and identify its species.',
    },
    badge: {
      title: 'حارس الطبيعة',
      title_en: 'Nature Guardian',
      icon_url: img('badges/dana'),
      is_rare: true,
    },
  },

  // 11 ── AJLOUN CASTLE
  {
    name: 'Ajloun Castle',
    slug: 'ajloun-castle',
    tagline: 'The Crusader-Defying Fortress',
    description: 'A 12th-century Muslim fortress built by Saladin\'s general to counter the Crusader threat, standing majestically above forested hills in northern Jordan.',
    image: img('ajloun/cover'),
    rating: 4.5,
    budget: 12,
    location: pt(35.7500, 32.3330),
    isPublished: true,
    detail: {
      overview: {
        text: 'Qal\'at Ar-Rabad (Ajloun Castle) commands views over the Jordan Valley and three Dead Sea tributaries, testament to its strategic military genius.',
        locationText: 'Ajloun Governorate, northern Jordan',
        recommendedStay: 'Half day',
        bestSeason: 'Spring and Autumn',
        averageCost: '5–20 JOD per day',
      },
      activities: [
        { name: 'Explore the castle towers and galleries' },
        { name: 'Hike in the Ajloun Forest Reserve' },
        { name: 'Visit the castle museum' },
        { name: 'Walk the Soap House Trail (RSCN)' },
        { name: 'Picnic in the pine and oak forests' },
      ],
      guideSections: [
        { title: 'How to get there', content: '70 km north of Amman; drive via Jerash (30 min away) for a combined day trip. Buses from Jerash reach Ajloun town.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring when wildflowers carpet the hills; autumn for clear views. Summer is green and pleasant due to elevation.', sortOrder: 2 },
        { title: 'What to bring', content: 'Comfortable shoes for uneven castle floors, a jacket (it\'s cooler at elevation), and binoculars for valley views.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Ajloun Castle (Qal\'at Ar-Rabad)', customOverview: 'The main fortress with four corner towers, a dry moat, and a small museum of Islamic artefacts inside.', budget: '3 JOD', location: pt(35.7501, 32.3332), coverImage: img('ajloun/castle') },
      { name: 'Ajloun Forest Reserve', customOverview: 'An RSCN-managed forest of wild oak, pistachio, and strawberry trees with marked trails and resident wildlife.', budget: '5 JOD', location: pt(35.7300, 32.3280), coverImage: img('ajloun/forest-reserve') },
      { name: 'Ajloun Castle Museum', customOverview: 'A small but well-curated museum inside the castle walls displaying medieval Islamic weapons, pottery, and maps.', budget: '0', location: pt(35.7502, 32.3333), coverImage: img('ajloun/museum') },
    ],
    restaurants: [
      { name: 'Ajloun Forest Reserve Restaurant', customOverview: 'RSCN-run restaurant in the forest serving fresh mezze, grills, and herbal teas amid pine trees.', budget: '8–18 JOD', coverImage: img('ajloun/forest-restaurant') },
      { name: 'Castle View Restaurant', customOverview: 'Simple hilltop eatery with direct views of the castle serving mansaf, kebabs, and tea.', budget: '6–12 JOD', coverImage: img('ajloun/castle-view') },
      { name: 'Abu Ali Restaurant – Ajloun Town', customOverview: 'Beloved local spot for rotisserie chicken, hummus, and fresh bread in Ajloun town centre.', budget: '4–8 JOD', coverImage: img('ajloun/abu-ali') },
    ],
    hotels: [
      { name: 'Ajloun Forest Reserve Cabins (RSCN)', customOverview: 'Beautiful wooden cabins nestled in the forest, bookable through RSCN, with guided trails and birdwatching.', budget: '70–100 JOD', bookingUrl: 'https://rscn.org.jo', coverImage: img('ajloun/forest-cabins') },
      { name: 'Ajloun Hotel', customOverview: 'Comfortable mid-range hotel in Ajloun town with easy access to the castle and forest reserve.', budget: '35–55 JOD', bookingUrl: '', coverImage: img('ajloun/ajloun-hotel') },
      { name: 'Anbara Eco Lodge', customOverview: 'A charming eco-guesthouse in the hills near Ajloun run by a local family with organic garden produce.', budget: '40–65 JOD', bookingUrl: '', coverImage: img('ajloun/anbara') },
    ],
    event: {
      name: 'Ajloun Forest Marathon',
      customOverview: 'A scenic trail running event through Ajloun\'s forested hills with routes for all fitness levels surrounded by wild oak trees.',
      startDate: new Date('2025-04-25'),
      endDate: new Date('2025-04-25'),
      startTime: '07:00',
      endTime: '14:00',
      startingFromPrice: '20 JOD',
      durationText: '7 hours',
      coverImage: img('ajloun/forest-marathon'),
      isPublished: true,
    },
    quest: {
      title: 'قلعة عجلون',
      title_en: 'Fortress of Ajloun',
      description: 'استكشف أبراج القلعة وتعلّم قصة صلاح الدين ثم تنزّه في غابة عجلون.',
      description_en: 'Explore the castle towers, learn about Saladin\'s military strategy, and then hike through the Ajloun Forest Reserve.',
      bonus_xp: 320,
      title_reward: 'Guardian of the North',
      badge_url: img('badges/ajloun'),
      icon_url: img('icons/ajloun'),
      start_coordinates: { lat: 32.3330, lng: 35.7500 },
      ai_requirement: 'From the castle tower, photograph the Jordan Valley view and estimate how many Crusader castles you could see from here.',
    },
    badge: {
      title: 'حارس القلعة',
      title_en: 'Castle Guardian',
      icon_url: img('badges/ajloun'),
      is_rare: false,
    },
  },

  // 12 ── UM QAIS
  {
    name: 'Um Qais',
    slug: 'um-qais',
    tagline: 'Ancient Gadara Above Three Countries',
    description: 'The ancient Decapolis city of Gadara perched dramatically above the meeting point of Jordan, Syria, and Israel, with black basalt ruins and spectacular panoramas.',
    image: img('um-qais/cover'),
    rating: 4.5,
    budget: 12,
    location: pt(35.6817, 32.6544),
    isPublished: true,
    detail: {
      overview: {
        text: 'Um Qais (Gadara) offers a unique mix of black basalt Roman theatres, Ottoman mansions, and arguably the most dramatic view in all of Jordan.',
        locationText: 'Irbid Governorate, northern Jordan',
        recommendedStay: 'Half day',
        bestSeason: 'Spring and Autumn',
        averageCost: '8–25 JOD per day',
      },
      activities: [
        { name: 'Explore the Western Theatre' },
        { name: 'Walk the Colonnaded Street' },
        { name: 'Visit the Ottoman village museum' },
        { name: 'Photograph the panoramic view over three countries' },
        { name: 'Birdwatch at the Yarmouk River gorge' },
      ],
      guideSections: [
        { title: 'How to get there', content: '110 km north of Amman; drive via Irbid or combine with a Jerash day trip. Buses reach Irbid, then a taxi to Um Qais.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Spring for vivid green hills; clear winter days give the best views of the three countries and the Sea of Galilee.', sortOrder: 2 },
        { title: 'What to bring', content: 'Camera (the view is extraordinary), comfortable walking shoes, and a light jacket for the hilltop breeze.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Western Theatre (Gadara)', customOverview: 'A beautifully preserved black basalt Roman theatre dating to the 2nd century AD with seats facing the panoramic view.', budget: '3 JOD', location: pt(35.6813, 32.6541), coverImage: img('um-qais/theatre') },
      { name: 'Ottoman Village & Museum', customOverview: 'A restored 19th-century Ottoman village with a museum of Gadara artefacts housed in the former mukhtar\'s house.', budget: '2 JOD', location: pt(35.6820, 32.6548), coverImage: img('um-qais/ottoman-village') },
      { name: 'Three-Country Viewpoint', customOverview: 'The most dramatic panorama in Jordan: standing at ancient Gadara looking into Syria, Israel, and the Sea of Galilee simultaneously.', budget: '0', location: pt(35.6810, 32.6550), coverImage: img('um-qais/viewpoint') },
    ],
    restaurants: [
      { name: 'Beit Al Baraka Restaurant', customOverview: 'The most atmospheric restaurant in the region — set in an Ottoman basalt house with sweeping three-country views.', budget: '18–35 JOD', coverImage: img('um-qais/beit-al-baraka') },
      { name: 'Um Qais Rest House Café', customOverview: 'Casual café at the site entrance with tea, coffee, and snacks while enjoying the hilltop panorama.', budget: '3–8 JOD', coverImage: img('um-qais/rest-house') },
      { name: 'Yarmouk River Picnic Area', customOverview: 'A scenic outdoor eating area by the Yarmouk River gorge popular for family picnics and BBQ gatherings.', budget: '0', coverImage: img('um-qais/yarmouk-picnic') },
    ],
    hotels: [
      { name: 'Um Qais Hotel', customOverview: 'Small family-run guesthouse in Um Qais village with basic but comfortable rooms and home-cooked meals.', budget: '25–40 JOD', bookingUrl: '', coverImage: img('um-qais/um-qais-hotel') },
      { name: 'Olive Branch Hotel – Jerash', customOverview: '40 minutes away in Jerash, a comfortable base for exploring both Um Qais and Jerash on the same trip.', budget: '55–80 JOD', bookingUrl: '', coverImage: img('um-qais/olive-branch') },
      { name: 'Amman boutique hotels', customOverview: 'Stay in Amman (2 hours) and day-trip to Um Qais; most Amman hotels can arrange transport.', budget: '50–150 JOD', bookingUrl: '', coverImage: img('um-qais/amman-base') },
    ],
    event: {
      name: 'Gadara Film Festival',
      customOverview: 'Outdoor cinema screenings of Arab and international films against the Roman ruins of Um Qais at twilight.',
      startDate: new Date('2025-08-12'),
      endDate: new Date('2025-08-16'),
      startTime: '20:00',
      endTime: '23:30',
      startingFromPrice: '8 JOD',
      durationText: '5 days',
      coverImage: img('um-qais/film-festival'),
      isPublished: true,
    },
    quest: {
      title: 'جادارا – مدينة الفلاسفة',
      title_en: 'Gadara – City of Philosophers',
      description: 'قف عند نقطة التقاء ثلاث دول وتأمل في حضارة جادارا الرومانية.',
      description_en: 'Stand at the convergence of three countries and reflect on the civilisation of ancient Gadara.',
      bonus_xp: 300,
      title_reward: 'Philosopher of Gadara',
      badge_url: img('badges/um-qais'),
      icon_url: img('icons/um-qais'),
      start_coordinates: { lat: 32.6544, lng: 35.6817 },
      ai_requirement: 'From the viewpoint, identify which direction Syria, Israel/Palestine, and the Sea of Galilee lie and describe the landscape.',
    },
    badge: {
      title: 'فيلسوف جادارا',
      title_en: 'Philosopher of Gadara',
      icon_url: img('badges/um-qais'),
      is_rare: false,
    },
  },

  // 13 ── BETHANY BEYOND THE JORDAN
  {
    name: 'Bethany Beyond the Jordan',
    slug: 'bethany',
    tagline: 'Where Jesus Was Baptised',
    description: 'A UNESCO World Heritage Site marking the site where Jesus Christ was baptised by John the Baptist on the eastern bank of the Jordan River.',
    image: img('bethany/cover'),
    rating: 4.6,
    budget: 15,
    location: pt(35.5583, 31.8364),
    isPublished: true,
    detail: {
      overview: {
        text: 'Al-Maghtas (baptism site) features Byzantine and early Christian ruins, a holy spring, and the exact spot on the Jordan River identified as the baptism site.',
        locationText: 'Balqa Governorate, western Jordan',
        recommendedStay: 'Half day',
        bestSeason: 'Year-round',
        averageCost: '8–20 JOD per day',
      },
      activities: [
        { name: 'Visit the Baptism Site (Al-Maghtas)' },
        { name: 'See John the Baptist\'s cave church' },
        { name: 'Walk among the Byzantine church ruins' },
        { name: 'Touch the Jordan River waters' },
        { name: 'Attend an interfaith religious ceremony' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'About 50 km west of Amman near the Dead Sea Road; taxis and tours from Amman and Dead Sea resorts run regularly.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'January 6 (Epiphany) draws large crowds for baptism ceremonies. Year-round is pleasant; summers are hot.', sortOrder: 2 },
        { title: 'What to bring', content: 'Modest, respectful clothing; cash for entry; a container to take home some Jordan River water as a keepsake.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Al-Maghtas Baptism Site', customOverview: 'The UNESCO-protected pool and Jordan River bank where Jesus\'s baptism is believed to have taken place.', budget: '12 JOD', location: pt(35.5580, 31.8360), coverImage: img('bethany/al-maghtas') },
      { name: 'John the Baptist Cave Church', customOverview: 'A cave church where John the Baptist is believed to have lived and prayed, with preserved mosaic floors.', budget: '0', location: pt(35.5590, 31.8370), coverImage: img('bethany/cave-church') },
      { name: 'Byzantine Churches Ruins', customOverview: 'Remains of several early Christian churches built over centuries to mark the holy baptism site.', budget: '0', location: pt(35.5585, 31.8365), coverImage: img('bethany/byzantine-ruins') },
    ],
    restaurants: [
      { name: 'Baptism Site Visitor Restaurant', customOverview: 'A modern restaurant at the visitor centre serving Jordanian mezze and light meals for pilgrims and tourists.', budget: '8–15 JOD', coverImage: img('bethany/visitor-restaurant') },
      { name: 'Dead Sea Resorts Dining', customOverview: 'The nearest full dining options are in the Dead Sea resort area, 15 minutes away, with extensive restaurant choices.', budget: '20–50 JOD', coverImage: img('bethany/dead-sea-dining') },
      { name: 'Al Manara Restaurant – Sweimeh', customOverview: 'Local Jordanian restaurant in nearby Sweimeh village popular with tour groups for grills and mezze.', budget: '8–14 JOD', coverImage: img('bethany/al-manara') },
    ],
    hotels: [
      { name: 'Marriott Dead Sea Resort & Spa', customOverview: 'Luxury Dead Sea resort 20 minutes from Bethany with private beach, spa, and multiple dining options.', budget: '170–300 JOD', bookingUrl: '', coverImage: img('bethany/marriott') },
      { name: 'Mövenpick Resort Dead Sea', customOverview: 'A short drive from the baptism site, this resort is an excellent base for the Bethany & Dead Sea combo.', budget: '150–280 JOD', bookingUrl: '', coverImage: img('bethany/movenpick') },
      { name: 'Baptism Site Guesthouse', customOverview: 'Simple but atmospheric guesthouse adjacent to the visitor centre for pilgrims wishing to stay near the holy site.', budget: '40–65 JOD', bookingUrl: '', coverImage: img('bethany/guesthouse') },
    ],
    event: {
      name: 'Epiphany Baptism Ceremony',
      customOverview: 'An annual interfaith religious ceremony at the Jordan River baptism site drawing thousands of pilgrims from around the world on January 6.',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-06'),
      startTime: '09:00',
      endTime: '14:00',
      startingFromPrice: '12 JOD',
      durationText: '5 hours',
      coverImage: img('bethany/epiphany'),
      isPublished: true,
    },
    quest: {
      title: 'عند نهر الأردن',
      title_en: 'At the Jordan River',
      description: 'زر موقع معمودية المسيح واقرأ عن تاريخ هذا المكان المقدس.',
      description_en: 'Visit the baptism site of Jesus Christ and reflect on the history of this sacred place where world religions converge.',
      bonus_xp: 260,
      title_reward: 'River Pilgrim',
      badge_url: img('badges/bethany'),
      icon_url: img('icons/bethany'),
      start_coordinates: { lat: 31.8364, lng: 35.5583 },
      ai_requirement: 'Touch the Jordan River waters and write a short reflection (3 sentences) on what this place means to you or to history.',
    },
    badge: {
      title: 'حاج النهر',
      title_en: 'River Pilgrim',
      icon_url: img('badges/bethany'),
      is_rare: false,
    },
  },

  // 14 ── SHAUMARI RESERVE
  {
    name: 'Shaumari Wildlife Reserve',
    slug: 'shaumari',
    tagline: 'Saving Arabia\'s Lost Wildlife',
    description: 'A small but vitally important wildlife reserve in eastern Jordan that successfully re-introduced the extinct-in-the-wild Arabian Oryx back to its native habitat.',
    image: img('shaumari/cover'),
    rating: 4.3,
    budget: 15,
    location: pt(36.9167, 31.8500),
    isPublished: true,
    detail: {
      overview: {
        text: 'Shaumari is home to Arabian Oryx, Persian onagers, ostriches, and gazelles — all species that were locally extinct and have been successfully reintroduced.',
        locationText: 'Zarqa Governorate, eastern Jordan (near Azraq)',
        recommendedStay: 'Half day',
        bestSeason: 'October–April',
        averageCost: '8–20 JOD per day',
      },
      activities: [
        { name: 'Arabian Oryx safari drive' },
        { name: 'Birdwatching tower' },
        { name: 'Photography of Persian onagers' },
        { name: 'Visit the breeding centre' },
        { name: 'Guided ranger walk' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'About 100 km east of Amman near Azraq; drive via the Zarqa–Azraq highway and follow RSCN signs.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'Autumn through spring for comfortable temperatures; summer is very hot in the eastern desert.', sortOrder: 2 },
        { title: 'What to bring', content: 'Binoculars, a telephoto lens for wildlife photography, water, and sun protection.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Arabian Oryx Enclosure', customOverview: 'The heart of the reserve — a large enclosure where the world\'s first captive-bred Arabian Oryx were reintroduced in 1978.', budget: '8 JOD', location: pt(36.9160, 31.8495), coverImage: img('shaumari/oryx-enclosure') },
      { name: 'Wildlife Observation Tower', customOverview: 'A raised tower offering 360° views across the reserve to spot onagers, gazelles, and ostriches.', budget: '0', location: pt(36.9170, 31.8505), coverImage: img('shaumari/observation-tower') },
      { name: 'Shaumari Breeding Centre', customOverview: 'The behind-the-scenes conservation facility where endangered species are bred for reintroduction across the Arab world.', budget: '0', location: pt(36.9155, 31.8490), coverImage: img('shaumari/breeding-centre') },
    ],
    restaurants: [
      { name: 'Shaumari Reserve Cafeteria', customOverview: 'Simple on-site cafeteria with hot drinks, sandwiches, and snacks for visitors after their safari.', budget: '3–7 JOD', coverImage: img('shaumari/cafeteria') },
      { name: 'Azraq Oasis Restaurant', customOverview: 'The best dining option nearby in Azraq town, serving traditional Iraqi-influenced Jordanian cuisine.', budget: '6–12 JOD', coverImage: img('shaumari/azraq-restaurant') },
      { name: 'Azraq Lodge Dining (RSCN)', customOverview: 'Meals at the nearby RSCN Azraq Lodge, a sustainable eco-lodge offering full board for overnight guests.', budget: '12–20 JOD', coverImage: img('shaumari/azraq-lodge-dining') },
    ],
    hotels: [
      { name: 'Azraq Lodge (RSCN)', customOverview: 'An eco-lodge built from recycled materials near Azraq Wetland, a 10-minute drive from Shaumari.', budget: '60–90 JOD', bookingUrl: 'https://rscn.org.jo', coverImage: img('shaumari/azraq-lodge') },
      { name: 'Azraq Palace Hotel', customOverview: 'Comfortable mid-range hotel in Azraq town convenient for exploring both Shaumari and Azraq Wetland.', budget: '30–50 JOD', bookingUrl: '', coverImage: img('shaumari/azraq-palace') },
      { name: 'Desert Highway Motel', customOverview: 'Basic but clean roadside accommodation on the Amman–Azraq highway for early-morning wildlife visits.', budget: '20–35 JOD', bookingUrl: '', coverImage: img('shaumari/highway-motel') },
    ],
    event: {
      name: 'Arabian Oryx Day',
      customOverview: 'An annual conservation awareness event at Shaumari featuring ranger talks, children\'s activities, and behind-the-scenes breeding centre tours.',
      startDate: new Date('2025-10-25'),
      endDate: new Date('2025-10-25'),
      startTime: '09:00',
      endTime: '16:00',
      startingFromPrice: '8 JOD',
      durationText: '7 hours',
      coverImage: img('shaumari/oryx-day'),
      isPublished: true,
    },
    quest: {
      title: 'المها العربية',
      title_en: 'Arabian Oryx',
      description: 'شاهد المها العربي المنقذ من الانقراض في بيئته الطبيعية في محمية الشومري.',
      description_en: 'Spot the once-extinct Arabian Oryx in its natural habitat at Shaumari Wildlife Reserve and learn its conservation story.',
      bonus_xp: 300,
      title_reward: 'Oryx Protector',
      badge_url: img('badges/shaumari'),
      icon_url: img('icons/shaumari'),
      start_coordinates: { lat: 31.8500, lng: 36.9167 },
      ai_requirement: 'Photograph an Arabian Oryx and share a fact about why this animal almost went extinct and how Jordan helped save it.',
    },
    badge: {
      title: 'حامي المها',
      title_en: 'Oryx Protector',
      icon_url: img('badges/shaumari'),
      is_rare: true,
    },
  },

  // 15 ── AZRAQ WETLAND
  {
    name: 'Azraq Wetland Reserve',
    slug: 'azraq-wetland',
    tagline: 'An Oasis in the Eastern Desert',
    description: 'A rare freshwater oasis in Jordan\'s eastern desert, a critical stopover for millions of migratory birds and home to a remarkable desert ecosystem.',
    image: img('azraq/cover'),
    rating: 4.4,
    budget: 12,
    location: pt(36.8222, 31.8197),
    isPublished: true,
    detail: {
      overview: {
        text: 'Once the largest wetland in the Arabian Peninsula, Azraq has been partially restored by RSCN and now hosts over 300 bird species and the rare Azraq killifish.',
        locationText: 'Zarqa Governorate, eastern Jordan',
        recommendedStay: 'Half day to 1 day',
        bestSeason: 'October–April (peak migration Feb–March)',
        averageCost: '8–25 JOD per day',
      },
      activities: [
        { name: 'Birdwatching from raised boardwalks' },
        { name: 'Photography of migratory birds' },
        { name: 'Visit the T.E. Lawrence House (Azraq Castle)' },
        { name: 'Night-time frog and wildlife spotting' },
        { name: 'Guided wetland ecology tour' },
      ],
      guideSections: [
        { title: 'How to get there', content: 'About 90 km east of Amman; drive via the Zarqa–Azraq highway. Easily combined with Shaumari Reserve nearby.', sortOrder: 1 },
        { title: 'Best time to visit', content: 'February and March for the peak spring migration with hundreds of thousands of birds passing through.', sortOrder: 2 },
        { title: 'What to bring', content: 'Binoculars (essential), a field guide to birds, long sleeves for mosquitoes near water, and a telephoto lens.', sortOrder: 3 },
      ],
    },
    places: [
      { name: 'Azraq Wetland Boardwalk', customOverview: 'A raised wooden boardwalk looping through the restored wetland, giving close views of water birds without disturbing habitat.', budget: '5 JOD', location: pt(36.8218, 31.8195), coverImage: img('azraq/boardwalk') },
      { name: 'Azraq Castle (Qasr al-Azraq)', customOverview: 'A basalt fortress dating to the Roman era, used as T.E. Lawrence\'s winter headquarters during the Arab Revolt of 1917.', budget: '2 JOD', location: pt(36.8217, 31.8203), coverImage: img('azraq/castle') },
      { name: 'Bird Observatory Tower', customOverview: 'A two-storey observation tower at the edge of the wetland offering panoramic views of the pools and surrounding desert.', budget: '0', location: pt(36.8225, 31.8190), coverImage: img('azraq/observatory') },
    ],
    restaurants: [
      { name: 'Azraq Lodge Restaurant (RSCN)', customOverview: 'Sustainable dining at the RSCN eco-lodge using local produce, with traditional Jordanian dishes and fresh herbs.', budget: '10–18 JOD', coverImage: img('azraq/lodge-restaurant') },
      { name: 'Al Waha Restaurant – Azraq', customOverview: '"The Oasis" — a local favourite in Azraq town for grilled meats, fresh bread, and cold drinks.', budget: '5–10 JOD', coverImage: img('azraq/al-waha') },
      { name: 'Desert Sunrise Café', customOverview: 'Early-opening café near the wetland entrance catering to birdwatchers with hot drinks and light breakfast options.', budget: '3–6 JOD', coverImage: img('azraq/sunrise-cafe') },
    ],
    hotels: [
      { name: 'Azraq Lodge (RSCN)', customOverview: 'Jordan\'s most sustainable lodge, built from recycled Syrian refugee shelter materials, with solar power and eco-tours.', budget: '60–90 JOD', bookingUrl: 'https://rscn.org.jo', coverImage: img('azraq/azraq-lodge') },
      { name: 'Azraq Palace Hotel', customOverview: 'Central Azraq town hotel with comfortable rooms, perfect for an early morning wetland birdwatching start.', budget: '30–50 JOD', bookingUrl: '', coverImage: img('azraq/palace-hotel') },
      { name: 'Badia Camp', customOverview: 'A desert camp experience 20 minutes from Azraq combining stargazing, local Bedouin culture, and Eastern Desert exploration.', budget: '45–70 JOD', bookingUrl: '', coverImage: img('azraq/badia-camp') },
    ],
    event: {
      name: 'Azraq Birdwatching Festival',
      customOverview: 'An annual birding festival at peak spring migration season, attracting ornithologists and nature lovers from across the Middle East.',
      startDate: new Date('2026-02-20'),
      endDate: new Date('2026-02-22'),
      startTime: '06:00',
      endTime: '18:00',
      startingFromPrice: '15 JOD',
      durationText: '3 days',
      coverImage: img('azraq/bird-festival'),
      isPublished: true,
    },
    quest: {
      title: 'واحة الصحراء',
      title_en: 'Desert Oasis',
      description: 'رصد خمسة أنواع مختلفة من الطيور في محمية عزرق المائية خلال زيارة واحدة.',
      description_en: 'Spot five different bird species at Azraq Wetland Reserve in a single visit using the boardwalk and observation tower.',
      bonus_xp: 320,
      title_reward: 'Desert Ornithologist',
      badge_url: img('badges/azraq'),
      icon_url: img('icons/azraq'),
      start_coordinates: { lat: 31.8197, lng: 36.8222 },
      ai_requirement: 'Photograph and identify five different bird species you spot at Azraq Wetland — name each species and describe its colour.',
    },
    badge: {
      title: 'عالم الطيور',
      title_en: 'Desert Ornithologist',
      icon_url: img('badges/azraq'),
      is_rare: false,
    },
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB:', URI);

  // Clear existing data
  await Promise.all([
    Destination.deleteMany({}),
    DestinationDetail.deleteMany({}),
    Place.deleteMany({}),
    Restaurant.deleteMany({}),
    Hotel.deleteMany({}),
    Event.deleteMany({}),
    Quest.deleteMany({}),
    Badge.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing collections');

  let totalPlaces = 0, totalRestaurants = 0, totalHotels = 0,
    totalEvents = 0, totalQuests = 0, totalBadges = 0;

  for (const data of destinationsData) {
    // 1. Create Destination
    const destination = await Destination.create({
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      image: data.image,
      rating: data.rating,
      budget: data.budget,
      location: data.location,
      isPublished: data.isPublished,
    });
    const dId = destination._id;

    // 2. DestinationDetail
    await DestinationDetail.create({
      destinationId: dId,
      ...data.detail,
    });

    // 3. Places
    for (const p of data.places) {
      await Place.create({ destinationId: dId, isPublished: true, workingDays: [], images: [], ...p });
    }
    totalPlaces += data.places.length;

    // 4. Restaurants
    for (const r of data.restaurants) {
      await Restaurant.create({ destinationId: dId, isPublished: true, workingDays: [], images: [], ...r });
    }
    totalRestaurants += data.restaurants.length;

    // 5. Hotels
    for (const h of data.hotels) {
      await Hotel.create({ destinationId: dId, isPublished: true, workingDays: [], images: [], ...h });
    }
    totalHotels += data.hotels.length;

    // 6. Event
    await Event.create({ destinationId: dId, images: [], ...data.event });
    totalEvents++;

    // 7. Quest
    const quest = await Quest.create(data.quest);
    totalQuests++;

    // 8. Badge linked to quest location concept
    await Badge.create({ ...data.badge, location_id: dId });
    totalBadges++;

    console.log(`  ✔ ${data.name}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Seed complete!`);
  console.log(`   Destinations : ${destinationsData.length}`);
  console.log(`   Places       : ${totalPlaces}`);
  console.log(`   Restaurants  : ${totalRestaurants}`);
  console.log(`   Hotels       : ${totalHotels}`);
  console.log(`   Events       : ${totalEvents}`);
  console.log(`   Quests       : ${totalQuests}`);
  console.log(`   Badges       : ${totalBadges}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});