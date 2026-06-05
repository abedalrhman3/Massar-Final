/**
 * seedWadiRum.js
 *
 * Inserts sample Places, Restaurants, Hotels, and Events
 * for an EXISTING Wadi Rum destination directly into MongoDB.
 *
 * Usage:
 *   node seedWadiRum.js <destinationId>
 *
 * Example:
 *   node seedWadiRum.js 665f1a2b3c4d5e6f7a8b9c0d
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('./models/Place');
const Restaurant = require('./models/Restaurant');
const Hotel = require('./models/Hotel');
const Event = require('./models/Event');
const DestinationDetail = require('./models/DestinationDetail');

// ── Grab destination ID from CLI args ─────────────────────────────────────────
const destId = process.argv[2];
if (!destId) {
  console.error('❌  Please provide the destination ID as an argument.');
  console.error('    node seedWadiRum.js <destinationId>');
  process.exit(1);
}

// ── Image paths (served from Vite/static public folder) ───────────────────────
const IMG = {
  jabalRum: '/images/detailPage/jabal-rum.jpg',
  aqabaFort: '/images/detailPage/aqaba-fortress.webp',
  aqabaMarine: '/images/detailPage/aqaba-marine-park.jpg',
  rest1: '/images/detailPage/wadi-rum-restaurant1.jpg',
  rest2: '/images/detailPage/wadi-rum-restaurant2.jpg',
  rest3: '/images/detailPage/wadi-rum-restaurant3.jpg',
  hotel: '/images/detailPage/hotel1.jpg',
  event: '/images/detailPage/event.jpg',
  wadiRum: '/images/destinationCard/wadi-rum.webp',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  const id = destId.trim();

  // ── 1. Upsert Destination Details ──────────────────────────────────────────
  await DestinationDetail.findOneAndUpdate(
    { destinationId: id },
    {
      destinationId: id,
      overview: {
        text: 'Wadi Rum is a breathtaking protected desert wilderness in southern Jordan, carved by wind and time into towering red sandstone cliffs and vast golden plains. One of the most iconic landscapes in the Middle East.',
        locationText: 'Southern Jordan, 4 hours from Amman',
        recommendedStay: '1 — 2 Days',
        bestSeason: 'October — April',
        averageCost: '25 — 80 JOD per day',
        pricingSummary: 'Budget-friendly to luxury, depending on accommodation and tour type.',
        bookTourUrl: 'https://www.booking.com/searchresults.html?ss=Wadi+Rum',
      },
      activities: [
        { name: 'Camel Trek', icon: 'camel', sortOrder: 1 },
        { name: 'Stargazing', icon: 'stars', sortOrder: 2 },
        { name: 'Rock Climbing', icon: 'climb', sortOrder: 3 },
        { name: 'Jeep Safari', icon: 'jeep', sortOrder: 4 },
        { name: 'Bedouin Camp Experience', icon: 'tent', sortOrder: 5 },
        { name: 'Sunset & Sunrise Views', icon: 'sunset', sortOrder: 6 },
      ],
      guideSections: [
        {
          type: 'transport',
          title: 'How to Get There',
          content: 'Wadi Rum is located 319km south of Amman. Drive via the Desert Highway (~4 hrs), or take a JETT bus from Amman\'s Abdali station to Aqaba with a connection to Rum Village.',
          sortOrder: 1,
        },
        {
          type: 'tips',
          title: 'What to Bring',
          content: 'Sunscreen, a hat, and closed shoes for daytime. A warm layer for cold desert nights. Cash is essential — most camps and guides do not accept cards.',
          sortOrder: 2,
        },
        {
          type: 'safety',
          title: 'Safety Tips',
          content: 'Always hire a licensed Bedouin guide for off-road exploration. Carry plenty of water (minimum 2L per person per day). Let someone know your planned route.',
          sortOrder: 3,
        },
        {
          type: 'culture',
          title: 'Cultural Etiquette',
          content: 'Dress modestly, especially when visiting Bedouin camps. Ask for permission before photographing locals. Remove shoes before entering tents.',
          sortOrder: 4,
        },
      ],
    },
    { upsert: true, new: true }
  );
  console.log('✅  Destination details upserted');

  // ── 2. Places ──────────────────────────────────────────────────────────────
  await Place.deleteMany({ destinationId: id });

  await Place.insertMany([
    {
      destinationId: id,
      name: 'Jabal Rum',
      customOverview: 'The highest peak in Jordan at 1,754 metres. A popular destination for serious climbers and hikers looking for a challenge with panoramic desert views.',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4021, 29.5831] },
      contact: {
        phone: '+962776100001',
        whatsapp: '+962776100001',
        email: 'jabalrum@example.com',
        address: 'Wadi Rum Reserve, Southern Jordan',
        instagramUrl: 'https://instagram.com/jabalrum',
        twitterUrl: 'https://twitter.com/jabalrum',
      },
      coverImage: IMG.jabalRum,
      images: [IMG.jabalRum, IMG.wadiRum],
    },
    {
      destinationId: id,
      name: "Lawrence's Spring",
      customOverview: "A natural freshwater spring named after T.E. Lawrence, surrounded by ancient Nabataean and Thamudic inscriptions carved into the surrounding rock face.",
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4310, 29.5910] },
      contact: {
        phone: '+962776100002',
        whatsapp: '+962776100002',
        email: 'lawrencespring@example.com',
        address: 'Rum Village, Wadi Rum',
        instagramUrl: 'https://instagram.com/lawrencespring',
        twitterUrl: 'https://twitter.com/lawrencespring',
      },
      coverImage: IMG.aqabaFort,
      images: [IMG.aqabaFort, IMG.wadiRum],
    },
    {
      destinationId: id,
      name: 'Khazali Canyon',
      customOverview: 'A narrow gorge rich with Nabataean and Thamudic rock art depicting animals, humans, and inscriptions that date back thousands of years.',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4600, 29.5400] },
      contact: {
        phone: '+962776100003',
        whatsapp: '+962776100003',
        email: 'khazali@example.com',
        address: 'Khazali Area, Wadi Rum Reserve',
        instagramUrl: 'https://instagram.com/khazalicanyon',
        twitterUrl: 'https://twitter.com/khazalicanyon',
      },
      coverImage: IMG.aqabaMarine,
      images: [IMG.aqabaMarine, IMG.jabalRum],
    },
  ]);
  console.log('✅  3 Places inserted');

  // ── 3. Restaurants ─────────────────────────────────────────────────────────
  await Restaurant.deleteMany({ destinationId: id });

  await Restaurant.insertMany([
    {
      destinationId: id,
      name: 'Rum Gate Restaurant',
      customOverview: 'The most popular dining spot at the entrance of Wadi Rum serving traditional Jordanian dishes including mansaf, falafel, and fresh-squeezed juices.',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4015, 29.5724] },
      contact: {
        phone: '+962776200001',
        whatsapp: '+962776200001',
        email: 'rumgate@example.com',
        address: 'Rum Village, Main Street, Wadi Rum',
        instagramUrl: 'https://instagram.com/rumgaterest',
        twitterUrl: 'https://twitter.com/rumgaterest',
      },
      coverImage: IMG.rest1,
      images: [IMG.rest1, IMG.rest2],
    },
    {
      destinationId: id,
      name: 'Bedouin Tent Kitchen',
      customOverview: 'An authentic open-air Bedouin kitchen serving zarb — a traditional slow-cooked underground barbecue — alongside fresh Arabic bread and assorted mezze.',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4100, 29.5650] },
      contact: {
        phone: '+962776200002',
        whatsapp: '+962776200002',
        email: 'bedouinkitchen@example.com',
        address: 'Central Wadi Rum Camp Zone',
        instagramUrl: 'https://instagram.com/bedouinkitchen',
        twitterUrl: 'https://twitter.com/bedouinkitchen',
      },
      coverImage: IMG.rest2,
      images: [IMG.rest2, IMG.rest3],
    },
    {
      destinationId: id,
      name: 'Desert Star Café',
      customOverview: 'A cozy café with panoramic views of the red sand dunes offering Jordanian coffee, herbal teas, kunafa, and light snacks throughout the day.',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4200, 29.5780] },
      contact: {
        phone: '+962776200003',
        whatsapp: '+962776200003',
        email: 'desertcafe@example.com',
        address: 'Near Visitor Center, Rum Village, Wadi Rum',
        instagramUrl: 'https://instagram.com/desertstarcafe',
        twitterUrl: 'https://twitter.com/desertstarcafe',
      },
      coverImage: IMG.rest3,
      images: [IMG.rest3, IMG.rest1],
    },
  ]);
  console.log('✅  3 Restaurants inserted');

  // ── 4. Hotels ──────────────────────────────────────────────────────────────
  await Hotel.deleteMany({ destinationId: id });

  await Hotel.insertMany([
    {
      destinationId: id,
      name: 'Wadi Rum Night Luxury Camp',
      customOverview: 'Award-winning luxury camp featuring transparent bubble tents with floor-to-ceiling Milky Way views, private bathrooms, and gourmet Bedouin dining included.',
      bookingUrl: 'https://www.booking.com/hotel/jo/wadi-rum-night-luxury-camp.html',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4050, 29.5600] },
      contact: {
        phone: '+962776300001',
        whatsapp: '+962776300001',
        email: 'luxurycamp@wadirum.com',
        address: 'Wadi Rum Protected Area, Southern Jordan',
        instagramUrl: 'https://instagram.com/wadirumluxury',
        twitterUrl: 'https://twitter.com/wadirumluxury',
      },
      coverImage: IMG.hotel,
      images: [IMG.hotel, IMG.wadiRum],
    },
    {
      destinationId: id,
      name: 'Rahayeb Desert Camp',
      customOverview: 'A traditional Bedouin camp with comfortable tents and private facilities. Highlights include camel rides at sunrise, a live zarb dinner, and guided sunset jeep tours.',
      bookingUrl: 'https://www.booking.com/hotel/jo/rahayeb-desert-camp.html',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4150, 29.5500] },
      contact: {
        phone: '+962776300002',
        whatsapp: '+962776300002',
        email: 'rahayeb@example.com',
        address: 'Wadi Rum Reserve, Camp Zone B',
        instagramUrl: 'https://instagram.com/rahayebcamp',
        twitterUrl: 'https://twitter.com/rahayebcamp',
      },
      coverImage: IMG.hotel,
      images: [IMG.hotel, IMG.wadiRum],
    },
    {
      destinationId: id,
      name: 'Sun City Camp',
      customOverview: 'Family-friendly camp with Martian-dome tents and standard tents. Packages include guided jeep safaris, rock climbing, and communal campfire evenings under the stars.',
      bookingUrl: 'https://www.booking.com/hotel/jo/sun-city-camp-wadi-rum.html',
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4250, 29.5450] },
      contact: {
        phone: '+962776300003',
        whatsapp: '+962776300003',
        email: 'suncity@example.com',
        address: 'Northern Zone, Wadi Rum Protected Area',
        instagramUrl: 'https://instagram.com/suncitycamp',
        twitterUrl: 'https://twitter.com/suncitycamp',
      },
      coverImage: IMG.hotel,
      images: [IMG.hotel, IMG.jabalRum],
    },
  ]);
  console.log('✅  3 Hotels inserted');

  // ── 5. Events ──────────────────────────────────────────────────────────────
  await Event.deleteMany({ destinationId: id });

  await Event.insertMany([
    {
      destinationId: id,
      name: 'Wadi Rum Desert Marathon',
      customOverview: 'Annual ultra-marathon through the red desert landscape with 10km, 21km, and 42km race categories. Registration includes camp accommodation and a post-race zarb dinner.',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-17'),
      startingFromPrice: 45,
      durationText: '3 Days',
      bookingUrl: 'https://www.wadirunmarathon.com/register',
      startTime: { from: new Date('2026-10-15T06:00:00Z'), to: new Date('2026-10-15T14:00:00Z') },
      endTime: { from: new Date('2026-10-17T12:00:00Z'), to: new Date('2026-10-17T18:00:00Z') },
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4015, 29.5724] },
      contact: {
        phone: '+962776400001',
        whatsapp: '+962776400001',
        email: 'marathon@wadirum.com',
        address: 'Rum Village Start Line, Wadi Rum',
        instagramUrl: 'https://instagram.com/wadirunmarathon',
        twitterUrl: 'https://twitter.com/wadirunmarathon',
      },
      coverImage: IMG.event,
      images: [IMG.event, IMG.wadiRum],
    },
    {
      destinationId: id,
      name: 'Bedouin Culture Night',
      customOverview: 'An immersive evening celebrating Bedouin heritage with live rababa music, traditional storytelling, henna art, and a ceremonial zarb feast around a fire pit under the stars.',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-01'),
      startingFromPrice: 25,
      durationText: '4 Hours',
      bookingUrl: 'https://www.bedouinnight.jo/book',
      startTime: { from: new Date('2026-11-01T18:00:00Z'), to: new Date('2026-11-01T22:00:00Z') },
      endTime: { from: new Date('2026-11-01T21:00:00Z'), to: new Date('2026-11-01T23:00:00Z') },
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4100, 29.5650] },
      contact: {
        phone: '+962776400002',
        whatsapp: '+962776400002',
        email: 'bedouinnight@example.com',
        address: 'Bedouin Camp Zone, Wadi Rum Reserve',
        instagramUrl: 'https://instagram.com/bedouinnight',
        twitterUrl: 'https://twitter.com/bedouinnight',
      },
      coverImage: IMG.event,
      images: [IMG.event, IMG.rest1],
    },
    {
      destinationId: id,
      name: 'Stargazing Astronomy Tour',
      customOverview: 'Expert-guided astronomy tour with high-powered telescopes in the heart of the desert, far from any light pollution. Includes constellation mapping and astrophotography tips.',
      startDate: new Date('2026-12-05'),
      endDate: new Date('2026-12-05'),
      startingFromPrice: 18,
      durationText: '3 Hours',
      bookingUrl: 'https://www.desertstargazing.jo/book',
      startTime: { from: new Date('2026-12-05T20:00:00Z'), to: new Date('2026-12-05T23:00:00Z') },
      endTime: { from: new Date('2026-12-05T22:30:00Z'), to: new Date('2026-12-05T23:30:00Z') },
      isPublished: true,
      location: { type: 'Point', coordinates: [35.4300, 29.5350] },
      contact: {
        phone: '+962776400003',
        whatsapp: '+962776400003',
        email: 'stargazing@example.com',
        address: 'Dark Sky Zone, Central Wadi Rum',
        instagramUrl: 'https://instagram.com/rumstargazing',
        twitterUrl: 'https://twitter.com/rumstargazing',
      },
      coverImage: IMG.event,
      images: [IMG.event, IMG.jabalRum],
    },
  ]);
  console.log('✅  3 Events inserted');

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\n🎉  All seed data inserted successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
