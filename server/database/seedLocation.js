const mongoose = require('mongoose');

// Define/Import your models
const Destination = mongoose.models.Destination || mongoose.model('Destination', new mongoose.Schema({ name: String }));
const Location = require('../models/Location'); // Assuming your model is exported from Location.js

async function seedLocations() {
    try {
        // 1. Fetch all destinations to map their IDs dynamically
        const destinations = await Destination.find({});

        // Create a lookup map: { "Petra": { id: ObjectId, name: "Petra" } }
        const destMap = {};
        destinations.forEach(dest => {
            destMap[dest.name] = dest._id;
        });

        const getDestId = (name) => destMap[name] || null;

        // 2. Define the 15 Locations with realistic coordinates tailored to Jordan's geography
        const locationsData = [
            {
                name: 'The Treasury (Al-Khazneh)',
                name_en: 'The Treasury',
                destination_id: getDestId('Petra'),
                coordinates: { lat: 30.3224, lng: 35.4516 }
            },
            {
                name: 'The Monastery (Ad-Deir)',
                name_en: 'The Monastery',
                destination_id: getDestId('Petra'),
                coordinates: { lat: 30.3376, lng: 35.4314 }
            },
            {
                name: 'Lawrence of Arabia Spring',
                name_en: 'Lawrence Spring',
                destination_id: getDestId('Wadi Rum'),
                coordinates: { lat: 29.5647, lng: 35.4251 }
            },
            {
                name: 'Burdah Rock Bridge',
                name_en: 'Burdah Bridge',
                destination_id: getDestId('Wadi Rum'),
                coordinates: { lat: 29.4715, lng: 35.4852 }
            },
            {
                name: 'O Beach Resort Area',
                name_en: 'O Beach Area',
                destination_id: getDestId('Dead Sea'),
                coordinates: { lat: 31.7132, lng: 35.5902 }
            },
            {
                name: 'Hadrian’s Arch',
                name_en: 'Hadrians Arch',
                destination_id: getDestId('Jerash'),
                coordinates: { lat: 32.2721, lng: 35.8912 }
            },
            {
                name: 'The Oval Plaza',
                name_en: 'The Oval Plaza',
                destination_id: getDestId('Jerash'),
                coordinates: { lat: 32.2778, lng: 35.8907 }
            },
            {
                name: 'Amman Citadel (Jabal al-Qal’a)',
                name_en: 'Amman Citadel',
                destination_id: getDestId('Amman'),
                coordinates: { lat: 31.9547, lng: 35.9348 }
            },
            {
                name: 'Roman Theatre',
                name_en: 'Roman Theatre',
                destination_id: getDestId('Amman'),
                coordinates: { lat: 31.9514, lng: 35.9392 }
            },
            {
                name: 'Tala Bay Marina',
                name_en: 'Tala Bay Marina',
                destination_id: getDestId('Aqaba'),
                coordinates: { lat: 29.4142, lng: 34.9781 }
            },
            {
                name: 'Siq Trail Canyon Entrance',
                name_en: 'Siq Trail Entrance',
                destination_id: getDestId('Wadi Mujib'),
                coordinates: { lat: 31.4674, lng: 35.5731 }
            },
            {
                name: 'Saint George Church (Mosaic Map)',
                name_en: 'St. George Church',
                destination_id: getDestId('Madaba'),
                coordinates: { lat: 31.7176, lng: 35.7939 }
            },
            {
                name: 'Dana Historic Village Plaza',
                name_en: 'Dana Village Plaza',
                destination_id: getDestId('Dana Biosphere Reserve'),
                coordinates: { lat: 30.6044, lng: 35.6112 }
            },
            {
                name: 'Roman Black Basalt Theatre',
                name_en: 'Basalt Theatre',
                destination_id: getDestId('Um Qais'),
                coordinates: { lat: 32.6552, lng: 35.6791 }
            },
            {
                name: 'The Baptism Pools',
                name_en: 'The Baptism Pools',
                destination_id: getDestId('Bethany Beyond the Jordan'),
                coordinates: { lat: 31.8364, lng: 35.5492 }
            }
        ];

        // 3. Clear existing locations and insert the updated coordinates data
        await Location.deleteMany({});
        const createdLocations = await Location.insertMany(locationsData);

        console.log(`🎉 Success! Seeded ${createdLocations.length} sub-locations with precise coordinates.`);
    } catch (error) {
        console.error('❌ Error seeding locations:', error);
    }
}

// Execution Block
if (require.main === module) {
    require('dotenv').config();
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/massar')
        .then(() => seedLocations())
        .then(() => mongoose.disconnect())
        .catch(console.error);
}