const SavedItem = require('../models/SavedItem');
const { checkAndAward } = require('../services/achievementService');
const AppError = require('../utils/AppError');

const modelMap = {
  place: () => require('../models/Place'),
  restaurant: () => require('../models/Restaurant'),
  hotel: () => require('../models/Hotel'),
  event: () => require('../models/Event'),
  destination: () => require('../models/Destination'),
};

// GET /api/saved  — private
// Returns saved items with full entity details populated
exports.getAll = async (req, res, next) => {
  try {
    const items = await SavedItem.find({ userId: req.user.userId });

    const populated = await Promise.all(
      items.map(async (item) => {
        try {
          const Model = modelMap[item.entityType]?.();
          if (!Model) return null;
          const entity = await Model.findById(item.entityId).lean();
          if (!entity) return null;
          return {
            _id: item._id,           // savedId — used for DELETE
            entityType: item.entityType,
            savedAt: item.savedAt,
            entity,
          };
        } catch {
          return null;
        }
      })
    );

    res.json({
      success: true,
      data: populated.filter(Boolean), // drop any that failed to fetch
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/saved  — private
exports.save = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;
    const Model = modelMap[entityType]?.();
    if (!Model) return next(new AppError('Invalid entity type', 400));
    const exists = await Model.findById(entityId);
    if (!exists) return next(new AppError('Entity not found', 404));
    const item = await SavedItem.create({
      userId: req.user.userId,
      entityType,
      entityId,
      savedAt: new Date(),
    });

    await checkAndAward(req.user.userId, 'save_count');

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('Item already saved', 400));
    }
    next(err);
  }
};

// DELETE /api/saved/:id  — private
exports.remove = async (req, res, next) => {
  try {
    const item = await SavedItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!item) return next(new AppError('Saved item not found', 404));
    res.json({ success: true, message: 'Removed from saved' });
  } catch (err) {
    next(err);
  }
};