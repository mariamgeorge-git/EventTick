const express = require('express');
const { registerUser, loginUser, getProfile } = require('../Controllers/userController');
const { protect } = require('../middleware/authorization');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
//add forget password api

module.exports = router;