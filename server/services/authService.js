const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const AppError = require('../utils/AppError');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');

// ── helpers ───────────────────────────────────────────────────────────────────

// Generate a cryptographically-safe random token.
// Returns { raw, hashed }
//   raw    → sent in the email URL (never stored)
//   hashed → stored in MongoDB (so a DB leak can't be used to reset passwords)
const generateToken = async () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = await bcrypt.hash(raw, 10);
  return { raw, hashed };
};

// Compare a raw token from the URL against a stored bcrypt hash.
const verifyToken = async (raw, hashed) => bcrypt.compare(raw, hashed);

// ── register ──────────────────────────────────────────────────────────────────
const register = async ({ name, username, email, password, role }) => {
  // Uniqueness check
  const existing = await User.findOne({
    $or: [
      { email },
      ...(username ? [{ username: username.trim() }] : []),
    ],
  });

  if (existing) {
    if (existing.email === email) throw new AppError('Email already in use', 400);
    throw new AppError('Username already in use', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Generate email-verification token (24-hour expiry)
  const { raw, hashed } = await generateToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name,
    username,
    email,
    passwordHash,
    role,
    isVerified: false,
    emailVerificationToken: hashed,
    emailVerificationExpires,
  });

  // Fire-and-forget — don't block the response if email fails
  sendVerificationEmail(user.email, user.name, raw).catch((err) =>
    console.error('[emailService] Failed to send verification email:', err.message)
  );

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    total_xp: user.total_xp,
    current_level: user.current_level,
  };
};

// ── login ─────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid email or password', 401);

  if (user.isBanned) {
    throw new AppError('Your account has been banned. Please contact support.', 403);
  }

  // Block unverified local accounts
  // (OAuth users are pre-verified; they have no passwordHash)
  if (!user.isVerified && user.passwordHash) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await UserSession.findOneAndUpdate(
    { userId: user._id },
    { token, expiresAt },
    { upsert: true, new: true }
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      total_xp: user.total_xp,
      current_level: user.current_level,
    },
  };
};

// ── logout ────────────────────────────────────────────────────────────────────
const logout = async (token) => {
  await UserSession.findOneAndDelete({ token });
};

// ── verifyEmail ───────────────────────────────────────────────────────────────
const verifyEmail = async (rawToken) => {
  // Case 1: find a pending (unverified) user with a valid token
  const pending = await User.find({
    isVerified: false,
    emailVerificationToken: { $ne: null },
    emailVerificationExpires: { $gt: new Date() },
  });

  let matched = null;
  for (const u of pending) {
    const ok = await verifyToken(rawToken, u.emailVerificationToken);
    if (ok) { matched = u; break; }
  }

  if (matched) {
    matched.isVerified = true;
    matched.emailVerificationToken = null;
    matched.emailVerificationExpires = null;
    await matched.save();
    return; // success
  }

  // Case 2: StrictMode fires useEffect twice — second call finds token already cleared.
  // If a user was verified within the last 60 seconds, treat as success silently.
  const recentlyVerified = await User.findOne({
    isVerified: true,
    emailVerificationToken: null,
    updatedAt: { $gt: new Date(Date.now() - 60 * 1000) },
  });

  if (recentlyVerified) return;

  throw new AppError('Verification link is invalid or has expired.', 400);
};


// ── forgotPassword ────────────────────────────────────────────────────────────
// Called by POST /auth/forgot-password  — always resolves (avoids email enumeration)
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // silently no-op

  const { raw, hashed } = await generateToken();

  user.passwordResetToken = hashed;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  sendPasswordResetEmail(user.email, user.name, raw).catch((err) =>
    console.error('[emailService] Failed to send reset email:', err.message)
  );
};

// ── resetPassword ─────────────────────────────────────────────────────────────
// Called by POST /auth/reset-password/:token
const resetPassword = async (rawToken, newPassword) => {
  const candidates = await User.find({
    passwordResetExpires: { $gt: new Date() },
    passwordResetToken: { $ne: null },
  });

  let matched = null;
  for (const u of candidates) {
    const ok = await verifyToken(rawToken, u.passwordResetToken);
    if (ok) { matched = u; break; }
  }

  if (!matched) throw new AppError('Reset link is invalid or has expired.', 400);

  matched.passwordHash = await bcrypt.hash(newPassword, 10);
  matched.passwordResetToken = null;
  matched.passwordResetExpires = null;
  await matched.save();

  // Invalidate all active sessions so the old password can't be reused
  await UserSession.deleteMany({ userId: matched._id });
};

module.exports = { register, login, logout, verifyEmail, forgotPassword, resetPassword };