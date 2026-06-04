const Hotel = require('../models/Hotel');
const { uploadHotelImage } = require('../services/uploadService');
const createListingController = require('../controllers/listingController');
const createListingRouter = require('./listingRouter');

const controller = createListingController(Hotel, uploadHotelImage);
module.exports = createListingRouter(controller);
