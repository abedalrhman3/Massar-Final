const AppError = require('../utils/AppError');
const { deleteFromCloudinary, deleteMultipleFromCloudinary } = require('../services/uploadService');







const createListingController = (Model, uploadFn) => ({

  
  getAll: async (req, res, next) => {
    try {
      
      const filter = {};
      if (!req.user || req.user.role !== 'admin') {
        filter.isPublished = true;
      }

      if (req.query.destinationId) filter.destinationId = req.query.destinationId;
      if (req.query.categoryId) filter.categoryId = req.query.categoryId;

      const items = await Model.find(filter)
        .populate('destinationId', 'name slug')
        .populate('categoryId', 'name icon');

      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  
  getOne: async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id)
        .populate('destinationId', 'name slug')
        .populate('categoryId', 'name icon');

      if (!item) return next(new AppError('Not found', 404));
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  
  
  
  
  create: async (req, res, next) => {
    
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
      coverImage = await uploadFn(coverFiles[0].buffer);

      
      const imageFiles = files.images || [];
      images = await Promise.all(imageFiles.map((f) => uploadFn(f.buffer)));

      const item = await Model.create({ ...req.body, coverImage, images });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      
      if (coverImage) await deleteFromCloudinary(coverImage).catch(() => { });
      if (images.length > 0) await deleteMultipleFromCloudinary(images).catch(() => { });
      next(err);
    }
  },

  
  
  update: async (req, res, next) => {
    
    let newCoverImage = null;
    let newImages = [];
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) return next(new AppError('Not found', 404));

      
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
        newCoverImage = await uploadFn(files.coverImage[0].buffer);
        req.body.coverImage = newCoverImage;
      }

      
      if (files.images && files.images.length > 0) {
        newImages = await Promise.all(files.images.map((f) => uploadFn(f.buffer)));
        req.body.images = newImages;
      }

      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

      
      if (newCoverImage && existing.coverImage) {
        await deleteFromCloudinary(existing.coverImage).catch(() => { });
      }
      if (newImages.length > 0 && existing.images && existing.images.length > 0) {
        await deleteMultipleFromCloudinary(existing.images).catch(() => { });
      }

      res.json({ success: true, data: item });
    } catch (err) {
      
      if (newCoverImage) await deleteFromCloudinary(newCoverImage).catch(() => { });
      if (newImages.length > 0) await deleteMultipleFromCloudinary(newImages).catch(() => { });
      next(err);
    }
  },

  
  
  remove: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return next(new AppError('Not found', 404));

      
      if (item.coverImage) await deleteFromCloudinary(item.coverImage).catch(() => { });
      if (item.images && item.images.length > 0) await deleteMultipleFromCloudinary(item.images).catch(() => { });

      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
});

module.exports = createListingController;
