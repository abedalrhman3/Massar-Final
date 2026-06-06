const AppError = require('../utils/AppError');
const { deleteFromCloudinary, deleteMultipleFromCloudinary } = require('../services/uploadService');

// Generic controller factory for Place, Restaurant, Hotel
// They all share the same logic — only the Model and uploadFn differ.
//
// uploadFn: a function (fileBuffer) => Promise<secureUrl>
//           e.g. uploadHotelImage from uploadService
//
const createListingController = (Model, uploadFn) => ({

  // GET /api/<resource>?destinationId=...&categoryId=...  — public
  getAll: async (req, res, next) => {
    try {
      // Base filter: empty for admins, or { isPublished: true } for regular users
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

  // GET /api/<resource>/:id  — public
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

  // POST /api/<resource>  — admin
  // Expects multipart/form-data with:
  //   coverImage  (single file, required)
  //   images      (multiple files, optional)
  create: async (req, res, next) => {
    // Track uploads so we can roll back if the DB save fails
    let coverImage = null;
    let images = [];
    try {
      // Parse all JSON-stringified fields from FormData
      const jsonFields = ['contact', 'location', 'operatingHours', 'workingDays'];
      for (const field of jsonFields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (err) {
            // leave as-is
          }
        }
      }

      const files = req.files || {};

      // Upload coverImage (required)
      const coverFiles = files.coverImage;
      if (!coverFiles || coverFiles.length === 0) {
        return next(new AppError('coverImage is required', 400));
      }
      coverImage = await uploadFn(coverFiles[0].buffer);

      // Upload extra images (optional)
      const imageFiles = files.images || [];
      images = await Promise.all(imageFiles.map((f) => uploadFn(f.buffer)));

      const item = await Model.create({ ...req.body, coverImage, images });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      // Rollback: remove any Cloudinary assets that were uploaded before the DB failed
      if (coverImage) await deleteFromCloudinary(coverImage).catch(() => { });
      if (images.length > 0) await deleteMultipleFromCloudinary(images).catch(() => { });
      next(err);
    }
  },

  // PUT /api/<resource>/:id  — admin
  // Optionally replaces coverImage and/or appends/replaces images
  update: async (req, res, next) => {
    // Track newly uploaded URLs so we can roll back if the DB update fails
    let newCoverImage = null;
    let newImages = [];
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) return next(new AppError('Not found', 404));

      // Parse all JSON-stringified fields from FormData
      const jsonFields = ['contact', 'location', 'operatingHours', 'workingDays'];
      for (const field of jsonFields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (err) {
            // leave as-is
          }
        }
      }

      const files = req.files || {};

      // Replace coverImage if a new one was uploaded
      if (files.coverImage && files.coverImage.length > 0) {
        newCoverImage = await uploadFn(files.coverImage[0].buffer);
        req.body.coverImage = newCoverImage;
      }

      // Replace images array if new ones were uploaded
      if (files.images && files.images.length > 0) {
        newImages = await Promise.all(files.images.map((f) => uploadFn(f.buffer)));
        req.body.images = newImages;
      }

      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

      // DB update succeeded — now safe to delete the old Cloudinary assets
      if (newCoverImage && existing.coverImage) {
        await deleteFromCloudinary(existing.coverImage).catch(() => { });
      }
      if (newImages.length > 0 && existing.images && existing.images.length > 0) {
        await deleteMultipleFromCloudinary(existing.images).catch(() => { });
      }

      res.json({ success: true, data: item });
    } catch (err) {
      // Rollback: remove newly uploaded assets — old ones are still in DB untouched
      if (newCoverImage) await deleteFromCloudinary(newCoverImage).catch(() => { });
      if (newImages.length > 0) await deleteMultipleFromCloudinary(newImages).catch(() => { });
      next(err);
    }
  },

  // DELETE /api/<resource>/:id  — admin
  // Removes Cloudinary images before deleting the document
  remove: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return next(new AppError('Not found', 404));

      // Clean up Cloudinary assets (best-effort — don't fail if Cloudinary is down)
      if (item.coverImage) await deleteFromCloudinary(item.coverImage).catch(() => { });
      if (item.images && item.images.length > 0) await deleteMultipleFromCloudinary(item.images).catch(() => { });

      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
});

module.exports = createListingController;
