const Category = require('../models/Category');
const AppError = require('../utils/AppError');


exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};


exports.create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};


exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
