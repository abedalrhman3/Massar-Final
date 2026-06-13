// scripts/cleanDb.js
require('dotenv').config();
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot clean production DB!');
    process.exit(1);
}

const COLLECTIONS = [
    'users',
    'usersessions',
    'userachievements',
    'notifications',
    'saveditems',
    'posts',
    'comments',
    'photos',
    'badges',
    'locations',
    'quests',
    'destinations',
    'destinationdetails',
    'places',
    'restaurants',
    'hotels',
    'events',
    'categories',
    'settings',
];

async function cleanDatabase() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    console.log('\n🧹 Starting database clean...\n');

    let totalDeleted = 0;

    for (const name of COLLECTIONS) {
        try {
            const result = await db.collection(name).deleteMany({});
            totalDeleted += result.deletedCount;
            console.log(`  ✅ ${name.padEnd(22)} — ${result.deletedCount} docs removed`);
        } catch (e) {
            console.log(`  ⚠️  ${name.padEnd(22)} — skipped (${e.message})`);
        }
    }

    await mongoose.disconnect();
    console.log(`\n🎉 Done! ${totalDeleted} total documents removed.`);
    console.log('   Collections, indexes, and schema intact.\n');
}

cleanDatabase().catch(console.error);