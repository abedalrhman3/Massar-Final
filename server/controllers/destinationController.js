const Destination = require('../models/Destination');
const DestinationDetail = require('../models/DestinationDetail');
const { generateSlug } = require('../services/slugService');
const { uploadDestinationImage, deleteFromCloudinary } = require('../services/uploadService');
const AppError = require('../utils/AppError');

// -------------------------------------------------------
// GET /api/destinations  — public
// -------------------------------------------------------
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (!req.user || req.user.role !== 'admin') {
      filter.isPublished = true;
    }
    const destinations = await Destination.find(filter);

    // Enrich with isLiked when a user is logged in
    let likedSet = new Set();
    if (req.user) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId).select('likedDestinations');
      if (user && user.likedDestinations) {
        likedSet = new Set(user.likedDestinations.map(String));
      }
    }

    const data = destinations.map((dest) => ({
      ...dest.toObject(),
      isLiked: likedSet.has(String(dest._id)),
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// GET /api/destinations/:slug  — public
// -------------------------------------------------------
exports.getOne = async (req, res, next) => {
  try {
    const filter = { slug: req.params.slug };
    if (!req.user || req.user.role !== 'admin') {
      filter.isPublished = true;
    }

    const destination = await Destination.findOne(filter);
    if (!destination) return next(new AppError('Destination not found', 404));

    let isLiked = false;
    if (req.user) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      if (user && user.likedDestinations) {
        isLiked = user.likedDestinations.includes(destination._id);
      }
    }

    const data = {
      ...destination.toObject(),
      isLiked
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// GET /api/destinations/:id/details  — public
// -------------------------------------------------------
// Inside your destinationController's getDetails function:
exports.getDetails = async (req, res, next) => {
  try {
    // req.params.id holds the destination ID sent via the URL
    const details = await DestinationDetail.findOne({ destinationId: req.params.id });

    if (!details) {
      // Option A: If details object doesn't exist yet, return an empty tracking template instead of a 404 error
      return res.status(200).json({ success: true, data: { overview: {}, activities: [], guideSections: [] } });
    }

    res.status(200).json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------
// POST /api/destinations  — admin
// -------------------------------------------------------
exports.create = async (req, res, next) => {
  try {
    const slug = await generateSlug(req.body.name, Destination);

    // Upload image to Cloudinary if provided
    let image;
    if (req.file) {
      image = await uploadDestinationImage(req.file.buffer);
    }

    const destination = await Destination.create({ ...req.body, slug, image });
    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// PUT /api/destinations/:id  — admin
// -------------------------------------------------------
exports.update = async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = await generateSlug(req.body.name, Destination);
    }

    // Upload new image if provided
    if (req.file) {
      // Delete old image from Cloudinary first
      const existing = await Destination.findById(req.params.id);
      if (existing && existing.image) {
        await deleteFromCloudinary(existing.image);
      }
      req.body.image = await uploadDestinationImage(req.file.buffer);
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!destination) return next(new AppError('Destination not found', 404));
    res.json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// PUT /api/destinations/:id/details  — admin
// -------------------------------------------------------
exports.updateDetails = async (req, res, next) => {
  try {
    const details = await DestinationDetail.findOneAndUpdate(
      { destinationId: req.params.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// DELETE /api/destinations/:id  — admin
// -------------------------------------------------------
exports.remove = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return next(new AppError('Destination not found', 404));

    // Delete image from Cloudinary
    if (destination.image) {
      await deleteFromCloudinary(destination.image);
    }

    await DestinationDetail.findOneAndDelete({ destinationId: req.params.id });
    res.json({ success: true, message: 'Destination deleted' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// POST /api/destinations/:id/like  — private
// -------------------------------------------------------
exports.toggleLike = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const destination = await Destination.findById(req.params.id);
    if (!destination) return next(new AppError('Destination not found', 404));

    const user = await User.findById(req.user.userId);
    if (!user) return next(new AppError('User not found', 404));

    if (!user.likedDestinations) {
      user.likedDestinations = [];
    }

    const index = user.likedDestinations.indexOf(destination._id);
    let isLiked = false;

    if (index === -1) {
      user.likedDestinations.push(destination._id);
      destination.likes = (destination.likes || 0) + 1;
      isLiked = true;
    } else {
      user.likedDestinations.splice(index, 1);
      destination.likes = Math.max(0, (destination.likes || 0) - 1);
      isLiked = false;
    }

    await user.save();
    await destination.save();

    res.json({
      success: true,
      likes: destination.likes,
      isLiked
    });
  } catch (err) {
    next(err);
  }
};
