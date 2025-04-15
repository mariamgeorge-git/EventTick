const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../Controllers/userController');
const { protect } = require('../middleware/authorization');

const router = express.Router();

router.get('/profile', protect, getUserProfile);

module.exports = router;
