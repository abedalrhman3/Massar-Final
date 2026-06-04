const Place = require('../models/Place');
const { uploadPlaceImage } = require('../services/uploadService');
const createListingController = require('../controllers/listingController');
const createListingRouter = require('./listingRouter');

const controller = createListingController(Place, uploadPlaceImage);
module.exports = createListingRouter(controller);
