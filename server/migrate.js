require("dotenv").config();
const mongoose = require("mongoose");


const Achievement     = require("./models/Achievement");
const Badge           = require("./models/Badge");
const Category        = require("./models/Category");
const ContactSchema   = require("./models/contactSchema");
const Destination     = require("./models/Destination");
const DestinationDetail = require("./models/DestinationDetail");
const Event           = require("./models/Event");
const Hotel           = require("./models/Hotel");
const Location        = require("./models/Location");
const Notification    = require("./models/Notification");
const Photo           = require("./models/Photo");
const Place           = require("./models/Place");
const Post            = require("./models/Post");
const Quest           = require("./models/Quest");
const Restaurant      = require("./models/Restaurant");
const SavedItem       = require("./models/SavedItem");
const User            = require("./models/User");
const UserAchievement = require("./models/UserAchievement");
const UserSession     = require("./models/UserSession");

const MODELS = {
  achievement:       Achievement,
  badge:             Badge,
  category:          Category,
  contactschema:     ContactSchema,
  destination:       Destination,
  destinationdetail: DestinationDetail,
  event:             Event,
  hotel:             Hotel,
  location:          Location,
  notification:      Notification,
  photo:             Photo,
  place:             Place,
  post:              Post,
  quest:             Quest,
  restaurant:        Restaurant,
  saveditem:         SavedItem,
  user:              User,
  userachievement:   UserAchievement,
  usersession:       UserSession,
};

async function migrate(modelName, field, defaultValue) {
  const Model = MODELS[modelName.toLowerCase()];

  if (!Model) {
    console.error(`❌ Model "${modelName}" not found.`);
    process.exit(1);
  }

  const result = await Model.updateMany(
    { [field]: { $exists: false } },
    { $set: { [field]: defaultValue } }
  );

  console.log(`✅ "${field}" added to ${result.modifiedCount} documents in "${modelName}"`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  
  const migrations = [
    
      { model: "place", field: "profilePicture", value: "" },
  ];

  if (migrations.length === 0) {
    console.log("⚠️  No migrations defined. Add them to the migrations array.");
    mongoose.disconnect();
    return;
  }

  for (const { model, field, value } of migrations) {
    await migrate(model, field, value);
  }

  mongoose.disconnect();
  console.log("🎉 All migrations done!");
}

main();