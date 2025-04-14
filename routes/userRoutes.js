const express = require('express');
const { registerUser, loginUser, getProfile } = require('../Controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/profile', protect, getProfile);

module.exports = router;
