const Destination = require('../models/Destination');
const DestinationDetail = require('../models/DestinationDetail');
const Location = require('../models/Location');
const { generateSlug } = require('../services/slugService');
const { uploadDestinationImage, deleteFromCloudinary } = require('../services/uploadService');
const AppError = require('../utils/AppError');






const BUDGET_THRESHOLDS = { low_max: 50, mid_max: 150 };

const buildLocationPayload = (destination, destinationId) => {
  
  let budget_category;
  const cost = destination.budget;
  if (cost != null) {
    if (cost <= BUDGET_THRESHOLDS.low_max) budget_category = 'Low';
    else if (cost <= BUDGET_THRESHOLDS.mid_max) budget_category = 'Medium';
    else budget_category = 'High';
  }

  
  let coordinates;
  const coords = destination.location && destination.location.coordinates;
  if (coords && coords.length === 2) {
    coordinates = { lat: coords[1], lng: coords[0] };
  }

  return {
    destination_id: destinationId,
    name: destination.name,
    name_en: destination.name,           
    description: destination.description || '',
    description_en: destination.description || '',
    average_cost: cost,
    budget_category,
    ...(coordinates && { coordinates }), // only include if present (coordinates is required)
  };
};

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




exports.getDetails = async (req, res, next) => {
  try {
    const details = await DestinationDetail.findOne({ destinationId: req.params.id });

    if (!details) {
      return res.status(200).json({ success: true, data: { overview: {}, activities: [], guideSections: [] } });
    }

    res.status(200).json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
};





exports.create = async (req, res, next) => {
  
  if (req.body.location && typeof req.body.location === 'string') {
    try { req.body.location = JSON.parse(req.body.location); }
    catch (_) { return next(new AppError('Invalid location format', 400)); }
  }
  try {
    const slug = await generateSlug(req.body.name, Destination);

    
    let image;
    if (req.file) {
      image = await uploadDestinationImage(req.file.buffer);
    }

    const destination = await Destination.create({ ...req.body, slug, image });

    
    
    try {
      const locationPayload = buildLocationPayload(destination, destination._id);
      if (locationPayload.coordinates) {
        await Location.create(locationPayload);
      }
      
    } catch (locErr) {
      console.error('Location auto-create failed (non-fatal):', locErr);
    }

    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};





exports.update = async (req, res, next) => {
  
  if (req.body.location && typeof req.body.location === 'string') {
    try { req.body.location = JSON.parse(req.body.location); }
    catch (_) { return next(new AppError('Invalid location format', 400)); }
  }
  try {
    if (req.body.name) {
      req.body.slug = await generateSlug(req.body.name, Destination);
    }

    
    if (req.file) {
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

    
    const locationPayload = buildLocationPayload(destination, destination._id);
    if (!locationPayload.coordinates) {
      delete locationPayload.coordinates;
    }
    await Location.findOneAndUpdate(
      { destination_id: destination._id },
      locationPayload,
      { new: true, upsert: true }
    );

    res.json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};




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





exports.remove = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return next(new AppError('Destination not found', 404));

    
    if (destination.image) {
      deleteFromCloudinary(destination.image).catch(err =>
        console.error('Cloudinary cleanup failed:', err)
      );
    }

    await DestinationDetail.findOneAndDelete({ destinationId: req.params.id });
    await Location.findOneAndDelete({ destination_id: req.params.id });

    res.json({ success: true, message: 'Destination deleted' });
  } catch (err) {
    next(err);
  }
};



exports.toggleLike = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const destinationId = req.params.id;
    const userId = req.user.userId;

    const destination = await Destination.findById(destinationId).lean();
    if (!destination) return next(new AppError('Destination not found', 404));

    const user = await User.findById(userId).select('likedDestinations').lean();
    if (!user) return next(new AppError('User not found', 404));

    const alreadyLiked = (user.likedDestinations || [])
      .map(id => id.toString())
      .includes(destinationId.toString());

    if (alreadyLiked) {
      await User.updateOne({ _id: userId }, { $pull: { likedDestinations: destination._id } });
      await Destination.updateOne({ _id: destinationId }, { $inc: { likes: -1 } });
    } else {
      await User.updateOne({ _id: userId }, { $addToSet: { likedDestinations: destination._id } });
      await Destination.updateOne({ _id: destinationId }, { $inc: { likes: 1 } });
    }

    const updated = await Destination.findById(destinationId).select('likes').lean();

    res.json({ success: true, likes: updated.likes, isLiked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};