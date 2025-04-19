const express = require('express');
const userController = require('../Controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forget-password', userController.forgetPassword);

// Protected routes
router.get('/profile', authenticateToken, userController.getCurrentUser);
router.put('/profile', authenticateToken, userController.updateUser);

// Admin routes
router.get('/', authenticateToken, authorizeAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeAdmin, userController.getUser);
router.put('/:id', authenticateToken, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeAdmin, userController.deleteUser);

module.exports = router;