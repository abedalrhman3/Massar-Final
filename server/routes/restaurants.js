const Restaurant = require('../models/Restaurant');
const { uploadRestaurantImage } = require('../services/uploadService');
const createListingController = require('../controllers/listingController');
const createListingRouter = require('./listingRouter');

const controller = createListingController(Restaurant, uploadRestaurantImage);
module.exports = createListingRouter(controller);
