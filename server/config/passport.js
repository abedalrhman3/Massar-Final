const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL || ''}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    // 1. Existing Google account
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // 2. Existing email account – link Google
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      user.avatar = avatar;
      await user.save();
      return done(null, user);
    }

    // 3. New user
    user = await User.create({
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatar,
      role: 'user',
    });
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize & deserialize (optional, but useful if sessions ever added)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
