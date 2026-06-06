const express = require('express');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { fields } = require('../middleware/upload');

// Accepts coverImage (1 file) + images (up to 10 files) in one multipart request
const listingUpload = fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// Generic route builder for Place, Restaurant, Hotel
// Pass in a controller created with listingController.js
const createListingRouter = (controller) => {
  const r = express.Router();

  // Public (but admins get to see unpublished items too)
  r.get('/', optionalAuth, controller.getAll);
  r.get('/:id', optionalAuth, controller.getOne);

  // Admin — listingUpload parses coverImage + images before the controller runs
  r.post('/', protect, adminOnly, listingUpload, controller.create);
  r.put('/:id', protect, adminOnly, listingUpload, controller.update);
  r.delete('/:id', protect, adminOnly, controller.remove);

  return r;
};

module.exports = createListingRouter;
