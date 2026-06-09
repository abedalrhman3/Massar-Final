const Location = require('../models/Location');
const Setting = require('../models/Setting');
const AppError = require('../utils/AppError');

// GET /api/locations?budgetCategory=Low  — public
exports.getAll = async (req, res, next) => {
  try {
    let query = {};
    const { budgetCategory } = req.query;

    if (budgetCategory && budgetCategory !== 'All') {
      let setting = await Setting.findOne();
      if (!setting) setting = await Setting.create({});
      const lowMax = setting.budget_ranges.low_max;
      const midMax = setting.budget_ranges.mid_max;

      if (budgetCategory === 'Low') {
        query = { average_cost: { $lte: lowMax } };
      } else if (budgetCategory === 'Medium') {
        query = { average_cost: { $gt: lowMax, $lte: midMax } };
      } else if (budgetCategory === 'High') {
        query = { average_cost: { $gt: midMax } };
      }
    } else if (req.query.budget) {
      // Legacy support for direct budget value
      query = { average_cost: { $lte: Number(req.query.budget) } };
    }

    const locations = await Location.find(query).populate('badge_id');

    // All locations are returned regardless of quest membership.
    // Rationale: quest-linked locations must be VISIBLE so users can discover quests
    // and click the Join button in the QuestPanel. Hiding them creates an unbreakable
    // deadlock (can't see location → can't join quest → location stays hidden forever).
    // The join gate lives in the check-in / completeTask endpoint, which is the right place.
    res.json(locations);
  } catch (err) {
    next(err);
  }
};


// GET /api/admin/settings/budget  — admin (direct return of ranges)
exports.getBudgetSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting.budget_ranges);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/settings/budget  — admin
exports.updateBudgetSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }
    if (req.body.low_max !== undefined) setting.budget_ranges.low_max = Number(req.body.low_max);
    if (req.body.mid_max !== undefined) setting.budget_ranges.mid_max = Number(req.body.mid_max);
    
    await setting.save();
    res.json({ success: true, budget_ranges: setting.budget_ranges });
  } catch (err) {
    next(err);
  }
};

// GET /api/locations/:id  — public
exports.getOne = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id).populate('badge_id');
    if (!location) return next(new AppError('Location not found', 404));
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

// POST /api/locations  — admin
exports.create = async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

// PUT /api/locations/:id  — admin
exports.update = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return next(new AppError('Location not found', 404));
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/locations/:id  — admin
exports.remove = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return next(new AppError('Location not found', 404));
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    next(err);
  }
};
