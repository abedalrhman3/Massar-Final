const Badge = require('../models/Badge');

// GET /api/badges
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find().populate('location_id', 'name name_en');
        res.json({ success: true, data: badges });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/badges/:id
exports.getBadge = async (req, res) => {
    try {
        const badge = await Badge.findById(req.params.id).populate('location_id', 'name name_en');
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        res.json({ success: true, data: badge });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/badges
exports.createBadge = async (req, res) => {
    try {
        const { title, title_en, icon_url, is_rare, location_id } = req.body;

        const badge = await Badge.create({
            title,
            title_en,
            icon_url,
            is_rare,
            ...(location_id && { location_id }),
        });

        res.status(201).json({ success: true, data: badge });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// PUT /api/badges/:id
exports.updateBadge = async (req, res) => {
    try {
        const { title, title_en, icon_url, is_rare, location_id } = req.body;

        const badge = await Badge.findByIdAndUpdate(
            req.params.id,
            {
                ...(title !== undefined && { title }),
                ...(title_en !== undefined && { title_en }),
                ...(icon_url !== undefined && { icon_url }),
                ...(is_rare !== undefined && { is_rare }),
                ...(location_id !== undefined && { location_id }),
            },
            { new: true, runValidators: true }
        );

        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        res.json({ success: true, data: badge });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE /api/badges/:id
exports.deleteBadge = async (req, res) => {
    try {
        const badge = await Badge.findByIdAndDelete(req.params.id);
        if (!badge) {
            return res.status(404).json({ success: false, message: 'Badge not found' });
        }
        res.json({ success: true, message: 'Badge deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};