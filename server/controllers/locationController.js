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
      if (!setting) {
        setting = await Setting.create({});
      }
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

    // FILTER QUEST-BOUND LOCATIONS:
    // Locations under a quest should NOT appear unless user has joined that quest.
    const Quest = require('../models/Quest');
    const allQuests = await Quest.find();
    
    // 1. Gather all location IDs that are part of ANY quest
    const questBoundLocationIds = new Set();
    allQuests.forEach(q => {
      if (q.locations && Array.isArray(q.locations)) {
        q.locations.forEach(locId => {
          questBoundLocationIds.add(locId.toString());
        });
      }
    });

    // 2. Identify the quests joined by the current user (if logged in)
    let joinedQuestIds = [];
    if (req.user && req.user.userId) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      if (user && user.joined_quests) {
        joinedQuestIds = user.joined_quests.map(id => id.toString());
      }
    }

    // 3. Gather all location IDs that are part of the quests joined by the user
    const allowedLocationIds = new Set();
    allQuests.forEach(q => {
      if (joinedQuestIds.includes(q._id.toString())) {
        if (q.locations && Array.isArray(q.locations)) {
          q.locations.forEach(locId => {
            allowedLocationIds.add(locId.toString());
          });
        }
      }
    });

    // 4. Filter locations
    const filteredLocations = locations.filter(loc => {
      const locIdStr = loc._id.toString();
      // If the location belongs to a quest, show it ONLY if user has joined that quest
      if (questBoundLocationIds.has(locIdStr)) {
        return allowedLocationIds.has(locIdStr);
      }
      // Otherwise, it's a standalone location, always show it
      return true;
    });

    res.json(filteredLocations); // Abed's client expects array directly
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
