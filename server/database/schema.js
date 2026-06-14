







function createCollection(db, name, validator) {
  try { db.dropCollection(name); } catch (_) {}
  db.createCollection(name, { validator: { $jsonSchema: validator } });
  print(`✔  ${name}`);
}





createCollection(db, "users", {
  bsonType: "object",
  required: ["name", "email", "passwordHash", "role", "isVerified", "createdAt"],
  properties: {
    _id:          { bsonType: "objectId" },
    name:         { bsonType: "string" },
    email:        { bsonType: "string" },
    passwordHash: { bsonType: "string" },
    role:         { bsonType: "string", enum: ["admin", "editor", "user"] },
    isVerified:   { bsonType: "bool" },
    createdAt:    { bsonType: "date" },
  },
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });





createCollection(db, "user_sessions", {
  bsonType: "object",
  required: ["userId", "token", "expiresAt", "createdAt"],
  properties: {
    _id:       { bsonType: "objectId" },
    userId:    { bsonType: "objectId" },   
    token:     { bsonType: "string" },
    expiresAt: { bsonType: "date" },
    createdAt: { bsonType: "date" },
  },
});

db.user_sessions.createIndex({ userId: 1 });
db.user_sessions.createIndex({ token: 1 }, { unique: true });
db.user_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 





createCollection(db, "destinations", {
  bsonType: "object",
  required: ["name", "slug", "isPublished", "createdAt"],
  properties: {
    _id:         { bsonType: "objectId" },
    name:        { bsonType: "string" },
    slug:        { bsonType: "string" },
    image:       { bsonType: "string" },
    rating:      { bsonType: "number", minimum: 0, maximum: 5 },
    location: {
      bsonType: "object",
      description: "GeoJSON Point",
      required: ["type", "coordinates"],
      properties: {
        type:        { bsonType: "string", enum: ["Point"] },
        coordinates: {
          bsonType: "array",
          items: { bsonType: "double" },
          minItems: 2,
          maxItems: 2,
          description: "[longitude, latitude]",
        },
      },
    },
    isPublished: { bsonType: "bool" },
    createdAt:   { bsonType: "date" },
  },
});

db.destinations.createIndex({ slug: 1 }, { unique: true });
db.destinations.createIndex({ location: "2dsphere" });
db.destinations.createIndex({ isPublished: 1 });





createCollection(db, "destination_details", {
  bsonType: "object",
  required: ["destinationId"],
  properties: {
    _id:           { bsonType: "objectId" },
    destinationId: { bsonType: "objectId" },   

    
    overview: {
      bsonType: "object",
      properties: {
        text:             { bsonType: "string" },
        locationText:     { bsonType: "string" },
        recommendedStay:  { bsonType: "string" },
        bestSeason:       { bsonType: "string" },
        averageCost:      { bsonType: "string" },
        pricingSummary:   { bsonType: "string" },
        bookTourUrl:      { bsonType: "string" },
      },
    },

    
    activities: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          name:      { bsonType: "string" },
          icon:      { bsonType: "string" },
          sortOrder: { bsonType: "number" },
        },
      },
    },

    
    guideSections: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          type:      {
            bsonType: "string",
            enum: ["tips", "safety", "culture", "transport", "food", "other"],
          },
          title:     { bsonType: "string" },
          content:   { bsonType: "string" },
          sortOrder: { bsonType: "number" },
        },
      },
    },
  },
});

db.destination_details.createIndex({ destinationId: 1 }, { unique: true });





createCollection(db, "categories", {
  bsonType: "object",
  required: ["name", "type"],
  properties: {
    _id:  { bsonType: "objectId" },
    name: { bsonType: "string" },
    type: {
      bsonType: "string",
      enum: ["place", "restaurant", "hotel", "event"],
    },
    icon: { bsonType: "string" },
  },
});

db.categories.createIndex({ type: 1 });





createCollection(db, "places", {
  bsonType: "object",
  required: ["destinationId", "categoryId", "isPublished"],
  properties: {
    _id:            { bsonType: "objectId" },
    destinationId:  { bsonType: "objectId" },   
    categoryId:     { bsonType: "objectId" },   
    googlePlaceId:  { bsonType: "string" },
    customOverview: { bsonType: "string" },
    isPublished:    { bsonType: "bool" },

    
    contact: {
      bsonType: "object",
      properties: {
        phone:        { bsonType: "string" },
        whatsapp:     { bsonType: "string" },
        email:        { bsonType: "string" },
        address:      { bsonType: "string" },
        instagramUrl: { bsonType: "string" },
        twitterUrl:   { bsonType: "string" },
      },
    },
  },
});

db.places.createIndex({ destinationId: 1 });
db.places.createIndex({ categoryId: 1 });
db.places.createIndex({ isPublished: 1 });





createCollection(db, "restaurants", {
  bsonType: "object",
  required: ["destinationId", "categoryId", "isPublished"],
  properties: {
    _id:            { bsonType: "objectId" },
    destinationId:  { bsonType: "objectId" },   
    categoryId:     { bsonType: "objectId" },   
    googlePlaceId:  { bsonType: "string" },
    customOverview: { bsonType: "string" },
    bookingUrl:     { bsonType: "string" },
    isPublished:    { bsonType: "bool" },

    contact: {
      bsonType: "object",
      properties: {
        phone:        { bsonType: "string" },
        whatsapp:     { bsonType: "string" },
        email:        { bsonType: "string" },
        address:      { bsonType: "string" },
        instagramUrl: { bsonType: "string" },
        twitterUrl:   { bsonType: "string" },
      },
    },
  },
});

db.restaurants.createIndex({ destinationId: 1 });
db.restaurants.createIndex({ categoryId: 1 });
db.restaurants.createIndex({ isPublished: 1 });





createCollection(db, "hotels", {
  bsonType: "object",
  required: ["destinationId", "categoryId", "isPublished"],
  properties: {
    _id:            { bsonType: "objectId" },
    destinationId:  { bsonType: "objectId" },   
    categoryId:     { bsonType: "objectId" },   
    googlePlaceId:  { bsonType: "string" },
    customOverview: { bsonType: "string" },
    bookingUrl:     { bsonType: "string" },
    isPublished:    { bsonType: "bool" },

    contact: {
      bsonType: "object",
      properties: {
        phone:        { bsonType: "string" },
        whatsapp:     { bsonType: "string" },
        email:        { bsonType: "string" },
        address:      { bsonType: "string" },
        instagramUrl: { bsonType: "string" },
        twitterUrl:   { bsonType: "string" },
      },
    },
  },
});

db.hotels.createIndex({ destinationId: 1 });
db.hotels.createIndex({ categoryId: 1 });
db.hotels.createIndex({ isPublished: 1 });





createCollection(db, "events", {
  bsonType: "object",
  required: ["destinationId", "categoryId", "name", "startDate", "isPublished"],
  properties: {
    _id:               { bsonType: "objectId" },
    destinationId:     { bsonType: "objectId" },   
    categoryId:        { bsonType: "objectId" },   
    name:              { bsonType: "string" },
    startDate:         { bsonType: "date" },
    endDate:           { bsonType: "date" },
    startingFromPrice: { bsonType: "number" },
    durationText:      { bsonType: "string" },
    bookingUrl:        { bsonType: "string" },
    isPublished:       { bsonType: "bool" },

    location: {
      bsonType: "object",
      description: "GeoJSON Point",
      required: ["type", "coordinates"],
      properties: {
        type:        { bsonType: "string", enum: ["Point"] },
        coordinates: {
          bsonType: "array",
          items: { bsonType: "double" },
          minItems: 2,
          maxItems: 2,
        },
      },
    },

    contact: {
      bsonType: "object",
      properties: {
        phone:        { bsonType: "string" },
        whatsapp:     { bsonType: "string" },
        email:        { bsonType: "string" },
        instagramUrl: { bsonType: "string" },
      },
    },
  },
});

db.events.createIndex({ destinationId: 1 });
db.events.createIndex({ categoryId: 1 });
db.events.createIndex({ startDate: 1 });
db.events.createIndex({ location: "2dsphere" });
db.events.createIndex({ isPublished: 1 });





createCollection(db, "saved_items", {
  bsonType: "object",
  required: ["userId", "entityType", "entityId", "savedAt"],
  properties: {
    _id:        { bsonType: "objectId" },
    userId:     { bsonType: "objectId" },   
    entityType: {
      bsonType: "string",
      enum: ["place", "restaurant", "hotel", "event", "destination"],
    },
    entityId:   { bsonType: "objectId" },
    savedAt:    { bsonType: "date" },
  },
});

db.saved_items.createIndex({ userId: 1 });
db.saved_items.createIndex({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });





createCollection(db, "notifications", {
  bsonType: "object",
  required: ["userId", "type", "title", "body", "isRead", "createdAt"],
  properties: {
    _id:       { bsonType: "objectId" },
    userId:    { bsonType: "objectId" },   
    type:      {
      bsonType: "string",
      enum: ["system", "promo", "update", "reminder"],
    },
    title:     { bsonType: "string" },
    body:      { bsonType: "string" },
    isRead:    { bsonType: "bool" },
    createdAt: { bsonType: "date" },
  },
});

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: 1 });





createCollection(db, "achievements", {
  bsonType: "object",
  required: ["name", "triggerType", "triggerValue"],
  properties: {
    _id:          { bsonType: "objectId" },
    name:         { bsonType: "string" },
    triggerType:  {
      bsonType: "string",
      enum: ["visit_count", "save_count", "review_count", "login_streak", "custom"],
    },
    triggerValue: { bsonType: "number" },
  },
});





createCollection(db, "user_achievements", {
  bsonType: "object",
  required: ["userId", "achievementId", "earnedAt"],
  properties: {
    _id:           { bsonType: "objectId" },
    userId:        { bsonType: "objectId" },       
    achievementId: { bsonType: "objectId" },       
    earnedAt:      { bsonType: "date" },
  },
});

db.user_achievements.createIndex({ userId: 1 });
db.user_achievements.createIndex({ userId: 1, achievementId: 1 }, { unique: true });




print("\n✅  All collections created with validators and indexes.");