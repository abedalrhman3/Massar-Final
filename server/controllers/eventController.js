const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const { uploadEventImage, deleteFromCloudinary, deleteMultipleFromCloudinary } = require('../services/uploadService');


exports.getAll = async (req, res, next) => {
  try {
    
    const filter = {};
    if (!req.user || req.user.role !== 'admin') {
      filter.isPublished = true;
    }

    if (req.query.destinationId) filter.destinationId = req.query.destinationId;
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const events = await Event.find(filter)
      .populate('destinationId', 'name slug')
      .populate('categoryId', 'name icon')
      .sort({ startDate: 1 });

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};


exports.getOne = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('destinationId', 'name slug')
      .populate('categoryId', 'name icon');

    if (!event) return next(new AppError('Event not found', 404));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};





exports.create = async (req, res, next) => {
  
  let coverImage = null;
  let images = [];
  try {
    
    const jsonFields = ['contact', 'location', 'operatingHours', 'workingDays'];
    for (const field of jsonFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          
        }
      }
    }

    const files = req.files || {};

    
    const coverFiles = files.coverImage;
    if (!coverFiles || coverFiles.length === 0) {
      return next(new AppError('coverImage is required', 400));
    }
    coverImage = await uploadEventImage(coverFiles[0].buffer);

    
    const imageFiles = files.images || [];
    images = await Promise.all(imageFiles.map((f) => uploadEventImage(f.buffer)));

    const event = await Event.create({ ...req.body, coverImage, images });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    
    if (coverImage) await deleteFromCloudinary(coverImage).catch(() => { });
    if (images.length > 0) await deleteMultipleFromCloudinary(images).catch(() => { });
    next(err);
  }
};


exports.update = async (req, res, next) => {
  
  let newCoverImage = null;
  let newImages = [];
  try {
    const existing = await Event.findById(req.params.id);
    if (!existing) return next(new AppError('Event not found', 404));

    
    const jsonFields = ['contact', 'location', 'operatingHours', 'workingDays'];
    for (const field of jsonFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          
        }
      }
    }

    const files = req.files || {};

    
    if (files.coverImage && files.coverImage.length > 0) {
      newCoverImage = await uploadEventImage(files.coverImage[0].buffer);
      req.body.coverImage = newCoverImage;
    }

    
    if (files.images && files.images.length > 0) {
      newImages = await Promise.all(files.images.map((f) => uploadEventImage(f.buffer)));
      req.body.images = newImages;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    
    if (newCoverImage && existing.coverImage) {
      await deleteFromCloudinary(existing.coverImage).catch(() => { });
    }
    if (newImages.length > 0 && existing.images && existing.images.length > 0) {
      await deleteMultipleFromCloudinary(existing.images).catch(() => { });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    
    if (newCoverImage) await deleteFromCloudinary(newCoverImage).catch(() => { });
    if (newImages.length > 0) await deleteMultipleFromCloudinary(newImages).catch(() => { });
    next(err);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return next(new AppError('Event not found', 404));

    
    if (event.coverImage) await deleteFromCloudinary(event.coverImage).catch(() => { });
    if (event.images && event.images.length > 0) await deleteMultipleFromCloudinary(event.images).catch(() => { });

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};
