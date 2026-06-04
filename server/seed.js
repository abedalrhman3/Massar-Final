const mongoose = require('mongoose');
const User = require('./models/User');
const Location = require('./models/Location');
const Badge = require('./models/Badge');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/massair');

async function seed() {
  const force = process.argv.includes('--force');

  if (force) {
    console.log("Force flag detected: Clearing all existing users...");
    await User.deleteMany({});
  } else {
    console.log("Seeding in safe mode: Preserving existing users.");
  }

  await Location.deleteMany({});
  await Badge.deleteMany({});

  const badge1 = await Badge.create({ title: 'سيد القلعة', title_en: 'Master of the Citadel', icon_url: '/assets/badges/castle_icon.png', is_rare: false });
  const badge2 = await Badge.create({ title: 'حارس الخزنة', title_en: 'Guardian of the Treasury', icon_url: '/assets/badges/petra_icon.png', is_rare: false });
  const badge3 = await Badge.create({ title: 'فارس المسرح', title_en: 'Knight of the Theater', icon_url: '/assets/badges/theatre_icon.png', is_rare: false });
  const rareBadge = await Badge.create({ title: 'خاتم الأردن', title_en: 'Jordan Legend', icon_url: '/assets/badges/jordan_legend.png', is_rare: true });

  await Location.create([
    {
      name: 'عمان - القلعة', name_en: 'Amman Citadel',
      description: 'إطلالة بانورامية على المدينة القديمة ومعبد هرقل', description_en: 'Panoramic view of the old city and the Temple of Hercules',
      coordinates: { lat: 31.9547, lng: 35.9344 },
      budget_category: 'Low', average_cost: 3.00,
      xp_reward: 50, badge_id: badge1._id
    },
    {
      name: 'البتراء - الخزنة', name_en: 'Petra - The Treasury',
      description: 'المدينة الوردية المنحوتة في الصخر', description_en: 'The rose-red city carved into the rock',
      coordinates: { lat: 30.3222, lng: 35.4444 },
      budget_category: 'High', average_cost: 50.00,
      xp_reward: 150, badge_id: badge2._id
    },
    {
      name: 'جرش - المسرح الجنوبي', name_en: 'Jerash - South Theater',
      description: 'أعمدة رومانية مهيبة ومدرجات تاريخية', description_en: 'Majestic Roman columns and historical amphitheaters',
      coordinates: { lat: 32.2722, lng: 35.8911 },
      budget_category: 'Medium', average_cost: 10.00,
      xp_reward: 100, badge_id: badge3._id
    }
  ]);

  const ahmadUser = await User.findOne({ username: 'ahmad' });
  if (!ahmadUser) {
    const hashedUserPassword = await bcrypt.hash('password123', 10);
    await User.create({
      username: 'ahmad',
      email: 'ahmad@example.com',
      password: hashedUserPassword,
      current_level: 'Explorer',
      total_xp: 0,
      active_frame_slug: 'default-frame',
      unlocked_frames: ['default-frame', 'petra-pink', 'amman-stone', 'wadi-rum-red']
    });
    console.log("Default user 'ahmad' created successfully!");
  } else {
    console.log("User 'ahmad' already exists, preserving existing profile.");
  }

  console.log("Database seeded successfully!");
  process.exit();
}

seed();
