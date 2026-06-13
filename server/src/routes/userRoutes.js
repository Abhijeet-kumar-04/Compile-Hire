const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Fixed the bug: requireAuth middleware is now applied
router.post('/sync', requireAuth, userController.syncUser);

module.exports = router;
