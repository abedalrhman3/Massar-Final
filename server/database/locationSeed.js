const mongoose = require('mongoose');

// Define/Import your models
const Destination = mongoose.models.Destination || mongoose.model('Destination', new mongoose.Schema({ name: String }));
const Location = require('../models/Location'); // Assuming your model is exported from Location.js

async function seedLocations() {
    try {
        // 1. Fetch all destinations to map their IDs dynamically
        const destinations = await Destination.find({});

        // Create a helper map for quick lookup: { "Petra": "6a2e1a5561..." }
        const destMap = {};
        destinations.forEach(dest => {
            destMap[dest.name] = dest._id;
        });

        // Helper to gracefully fall back if a destination isn't seeded yet
        const getDestId = (name) => destMap[name] || new mongoose.Types.ObjectId();

        // 2. Define the 15 Locations with their corresponding destination_id
        const locationsData = [
            {
                name: 'The Treasury (Al-Khazneh)',
                name_en: 'The Treasury',
                destination_id: getDestId('Petra'),
                coordinates: {
                    lat: 35.4444,
                    lng: 30.3285
                },

            },
            {
                name: 'The Monastery (Ad-Deir)',
                name_en: 'The Monastery',
                destination_id: getDestId('Petra')
            },
            {
                name: 'Lawrence of Arabia Spring',
                name_en: 'Lawrence Spring',
                destination_id: getDestId('Wadi Rum')
            },
            {
                name: 'Burdah Rock Bridge',
                name_en: 'Burdah Bridge',
                destination_id: getDestId('Wadi Rum')
            },
            {
                name: 'Amman Beach',
                name_en: 'Amman Beach',
                destination_id: getDestId('Dead Sea')
            },
            {
                name: 'Hadrian’s Arch',
                name_en: 'Hadrians Arch',
                destination_id: getDestId('Jerash')
            },
            {
                name: 'The Oval Plaza',
                name_en: 'The Oval Plaza',
                destination_id: getDestId('Jerash')
            },
            {
                name: 'Amman Citadel (Jabal al-Qal’a)',
                name_en: 'Amman Citadel',
                destination_id: getDestId('Amman')
            },
            {
                name: 'Roman Theatre',
                name_en: 'Roman Theatre',
                destination_id: getDestId('Amman')
            },
            {
                name: 'Tala Bay',
                name_en: 'Tala Bay',
                destination_id: getDestId('Aqaba')
            },
            {
                name: 'Siq Trail',
                name_en: 'Siq Trail',
                destination_id: getDestId('Wadi Mujib')
            },
            {
                name: 'Saint George Church (Mosaic Map)',
                name_en: 'St. George Church',
                destination_id: getDestId('Madaba')
            },
            {
                name: 'Dana Village',
                name_en: 'Dana Village',
                destination_id: getDestId('Dana Biosphere Reserve')
            },
            {
                name: 'Roman Black Basalt Theatre',
                name_en: 'Basalt Theatre',
                destination_id: getDestId('Um Qais')
            },
            {
                name: 'The Baptism Pools',
                name_en: 'The Baptism Pools',
                destination_id: getDestId('Bethany Beyond the Jordan')
            }
        ];

        // 3. Clear existing locations (optional) and insert the new data
        await Location.deleteMany({});
        const createdLocations = await Location.insertMany(locationsData);

        console.log(`✅ Successfully seeded ${createdLocations.length} locations linked to destinations!`);
    } catch (error) {
        console.error('❌ Error seeding locations:', error);
    }
}

// Example invocation block (Ensure MONGO_URI is set)
if (require.main === module) {
    require('dotenv').config();
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/massar')
        .then(() => seedLocations())
        .then(() => mongoose.disconnect())
        .catch(console.error);
}