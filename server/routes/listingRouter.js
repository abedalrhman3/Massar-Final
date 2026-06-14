const express = require('express');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { fields } = require('../middleware/upload');


const listingUpload = fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);



const createListingRouter = (controller) => {
  const r = express.Router();

  
  r.get('/', optionalAuth, controller.getAll);
  r.get('/:id', optionalAuth, controller.getOne);

  
  r.post('/', protect, adminOnly, listingUpload, controller.create);
  r.put('/:id', protect, adminOnly, listingUpload, controller.update);
  r.delete('/:id', protect, adminOnly, controller.remove);

  return r;
};

module.exports = createListingRouter;
