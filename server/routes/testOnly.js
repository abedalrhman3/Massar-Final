// routes/testOnly.js
const router = require('express').Router();
const User = require('../models/User');

router.post('/verify-user', async (req, res) => {
    await User.findOneAndUpdate(
        { email: req.body.email },
        { isVerified: true }
    );
    res.json({ ok: true });
});

module.exports = router;