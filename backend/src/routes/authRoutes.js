const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Sync Route - Triggers Middleware to ensure User exists in DB
// POST /api/auth/sync
router.post('/sync', authMiddleware, roleMiddleware([]), (req, res) => {
    // If we reached here, roleMiddleware has already ensured the user 
    // exists in Firestore (or created them).
    // We just return the latest user data.
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
