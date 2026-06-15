const mongoose = require('mongoose');
const Place = require('../models/Place');
const Restaurant = require('../models/Restaurant');
const Hotel = require('../models/Hotel');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Massar-main';
const wadiRumId = new mongoose.Types.ObjectId('6a2e2e8f3da5e16c3d13448c');

// ─── PLACES ───────────────────────────────────────────────────────────────────

const places = [
    {
        destinationId: wadiRumId,
        name: 'Jabal Umm Adaami',
        googlePlaceId: 'ChIJf4N2v3_GzBURe1cDIbFGCGk',
        customOverview:
            "Jordan's highest peak at 1,854m, sitting on the Saudi border. The climb is a manageable half-day hike rewarded with panoramic views stretching across the entire Wadi Rum protected area and into Saudi Arabia on clear days.",
        budget: 'Free',
        operatingHours: { start: '06:00', end: '18:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '', email: '', website: '' },
        isPublished: true,
        location: { type: 'Point', coordinates: [36.9217, 29.5503] },
        coverImage: 'https://example.com/images/jabal-umm-adaami-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: "Lawrence's Spring",
        googlePlaceId: 'ChIJQ8_wKlbGzBURHvMV5WDYCJU',
        customOverview:
            'A natural freshwater spring nestled high in the mountains, named after T.E. Lawrence who described it in Seven Pillars of Wisdom. Ancient Nabataean engravings and rock carvings decorate the surrounding sandstone, making it one of the most historically layered spots in the valley.',
        budget: 'Free',
        operatingHours: { start: '07:00', end: '17:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '', email: '', website: '' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4167, 29.5833] },
        coverImage: 'https://example.com/images/lawrence-spring-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: 'Khazali Canyon',
        googlePlaceId: 'ChIJRzP1mGvGzBURtNaWo7JQXRY',
        customOverview:
            'A narrow siq cutting deep into a granite massif, its walls covered in thousands of years of Thamudic and Nabataean petroglyphs — human figures, ibex, camels, and inscriptions. The canyon stays cool even in summer and can be partially walked on foot.',
        budget: 'Free',
        operatingHours: { start: '07:00', end: '18:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '', email: '', website: '' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4583, 29.5417] },
        coverImage: 'https://example.com/images/khazali-canyon-cover.jpg',
        images: [],
    },
];

// ─── RESTAURANTS ──────────────────────────────────────────────────────────────

const restaurants = [
    {
        destinationId: wadiRumId,
        name: 'Wadi Rum Night Luxury Camp Restaurant',
        googlePlaceId: '',
        customOverview:
            "The flagship dining tent of one of Wadi Rum's top-rated camps. Meals are traditional Jordanian: slow-cooked zarb (underground BBQ), mansaf with jameed yogurt sauce, and fresh mezze spreads served under a canopy of stars. Breakfast includes warm khobz, labneh, and Bedouin tea.",
        bookingUrl: 'https://www.wadirum-night.com',
        budget: '$$',
        operatingHours: { start: '07:00', end: '22:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 77 740 0070', email: 'info@wadirum-night.com', website: 'https://www.wadirum-night.com' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4200, 29.5650] },
        coverImage: 'https://example.com/images/wadi-rum-night-restaurant-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: 'Rest House Restaurant',
        googlePlaceId: 'ChIJL2kXaGrGzBURmNpQ3fVoY1s',
        customOverview:
            'The main eatery at the Wadi Rum Visitor Centre, making it the first and last meal stop for most visitors. Serves reliable Jordanian classics — grilled meats, hummus, ful, and fresh salads — in an air-conditioned setting with views toward the valley entrance.',
        bookingUrl: '',
        budget: '$',
        operatingHours: { start: '08:00', end: '20:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 3 209 0600', email: '', website: '' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4061, 29.5731] },
        coverImage: 'https://example.com/images/rest-house-restaurant-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: 'Rahayeb Desert Camp Kitchen',
        googlePlaceId: '',
        customOverview:
            'A beloved camp kitchen known for its generous Bedouin hospitality. Every evening a zarb feast is prepared in a sand pit — whole chicken and lamb slow-roasted over coals for hours. Guests eat communally on floor cushions by firelight, ending with cardamom-spiced qahwa and dates.',
        bookingUrl: 'https://www.rahayebcamp.com',
        budget: '$$',
        operatingHours: { start: '07:00', end: '21:30' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 77 727 5050', email: 'info@rahayebcamp.com', website: 'https://www.rahayebcamp.com' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4350, 29.5580] },
        coverImage: 'https://example.com/images/rahayeb-camp-kitchen-cover.jpg',
        images: [],
    },
];

// ─── HOTELS ───────────────────────────────────────────────────────────────────

const hotels = [
    {
        destinationId: wadiRumId,
        name: 'Wadi Rum Night Luxury Camp',
        googlePlaceId: 'ChIJh3mRZW_GzBURoEqD5kPTNmc',
        customOverview:
            "Consistently ranked among Jordan's finest desert experiences. Martian-dome bubble tents with transparent ceilings let guests sleep under an unobstructed Milky Way. Each unit has a private bathroom, heating and A/C, and a furnished terrace. Full-board packages include jeep tours and camel rides.",
        bookingUrl: 'https://www.wadirum-night.com',
        budget: '$$$',
        operatingHours: { start: '00:00', end: '23:59' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 77 740 0070', email: 'info@wadirum-night.com', website: 'https://www.wadirum-night.com' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4200, 29.5650] },
        coverImage: 'https://example.com/images/wadi-rum-night-luxury-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: 'Memories Aicha Luxury Camp',
        googlePlaceId: '',
        customOverview:
            'Intimate luxury camp with just a handful of Bedouin-style tents upgraded with ensuite bathrooms and plush bedding. Known for exceptionally attentive service and a quieter atmosphere away from larger camps. The open-air lounge area is a highlight at sunset when the cliffs turn deep red.',
        bookingUrl: 'https://www.memoriesaicha.com',
        budget: '$$$',
        operatingHours: { start: '00:00', end: '23:59' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 79 554 3322', email: 'info@memoriesaicha.com', website: 'https://www.memoriesaicha.com' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4410, 29.5600] },
        coverImage: 'https://example.com/images/memories-aicha-cover.jpg',
        images: [],
    },
    {
        destinationId: wadiRumId,
        name: 'Rahayeb Desert Camp',
        googlePlaceId: 'ChIJK9mTqHDGzBURpL2eRvWsA0Y',
        customOverview:
            'A well-established mid-range camp popular with independent travellers and tour groups alike. Offers a mix of Bedouin goat-hair tents and private safari-style units. The communal fire circle, live Bedouin music nights, and included jeep tour make it exceptional value for the price.',
        bookingUrl: 'https://www.rahayebcamp.com',
        budget: '$$',
        operatingHours: { start: '00:00', end: '23:59' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        contact: { phone: '+962 77 727 5050', email: 'info@rahayebcamp.com', website: 'https://www.rahayebcamp.com' },
        isPublished: true,
        location: { type: 'Point', coordinates: [35.4350, 29.5580] },
        coverImage: 'https://example.com/images/rahayeb-desert-camp-cover.jpg',
        images: [],
    },
];

// ─── EVENTS ───────────────────────────────────────────────────────────────────

const events = [
    {
        destinationId: wadiRumId,
        name: 'Wadi Rum Desert Marathon',
        customOverview:
            'An annual ultra-running event that sends competitors through the most dramatic terrain in the Middle East — sandy plains, rocky jebels, and narrow canyons. Distances range from 10km to a full 42km marathon. Runners from over 30 countries participate, and the finish line celebration doubles as a desert cultural festival.',
        startDate: new Date('2025-03-14'),
        startTime: '07:00',
        endDate: new Date('2025-03-16'),
        endTime: '18:00',
        startingFromPrice: '85 JOD',
        durationText: '3 days',
        bookingUrl: 'https://www.wadirummarathon.com',
        location: { type: 'Point', coordinates: [35.4061, 29.5731] },
        coverImage: 'https://example.com/images/wadi-rum-marathon-cover.jpg',
        images: [],
        contact: { phone: '', email: 'info@wadirummarathon.com', website: 'https://www.wadirummarathon.com' },
        isPublished: true,
    },
    {
        destinationId: wadiRumId,
        name: 'Bedouin Music & Stargazing Night',
        customOverview:
            'A curated evening experience running every weekend throughout the cooler months. Local Bedouin musicians perform traditional rababa and tabla around a central fire while a resident astronomer guides guests through the constellations with a high-powered telescope. Ends with tea, dates, and open Q&A.',
        startDate: new Date('2025-10-03'),
        startTime: '19:30',
        endDate: new Date('2025-10-03'),
        endTime: '23:00',
        startingFromPrice: '25 JOD',
        durationText: '3.5 hours',
        bookingUrl: 'https://www.visitwadirum.jo/stargazing',
        location: { type: 'Point', coordinates: [35.4250, 29.5620] },
        coverImage: 'https://example.com/images/stargazing-night-cover.jpg',
        images: [],
        contact: { phone: '+962 3 209 0600', email: 'events@visitwadirum.jo', website: 'https://www.visitwadirum.jo' },
        isPublished: true,
    },
    {
        destinationId: wadiRumId,
        name: 'Hot Air Balloon Festival',
        customOverview:
            'A two-day festival held each spring where a fleet of hot air balloons launches at dawn over the red sands. Morning flights last 45–60 minutes and offer an unmatched aerial perspective of the valley. The ground festival features Jordanian food stalls, handicrafts, and live cultural performances throughout the day.',
        startDate: new Date('2025-04-18'),
        startTime: '05:30',
        endDate: new Date('2025-04-19'),
        endTime: '20:00',
        startingFromPrice: '120 JOD',
        durationText: '2 days',
        bookingUrl: 'https://www.wadirum-balloon.com',
        location: { type: 'Point', coordinates: [35.4100, 29.5700] },
        coverImage: 'https://example.com/images/balloon-festival-cover.jpg',
        images: [],
        contact: { phone: '+962 79 888 1234', email: 'fly@wadirum-balloon.com', website: 'https://www.wadirum-balloon.com' },
        isPublished: true,
    },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

async function seedWadiRum() {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    const existingPlaces = await Place.countDocuments({ destinationId: wadiRumId });
    if (existingPlaces > 0) {
        console.log('⚠️  Wadi Rum already seeded. Skipping.');
        await mongoose.disconnect();
        return;
    }

    await Place.insertMany(places);
    console.log('✅ Places seeded');

    await Restaurant.insertMany(restaurants);
    console.log('✅ Restaurants seeded');

    await Hotel.insertMany(hotels);
    console.log('✅ Hotels seeded');

    await Event.insertMany(events);
    console.log('✅ Events seeded');

    await mongoose.disconnect();
    console.log('✅ Done. Disconnected.');
}

seedWadiRum().catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
});