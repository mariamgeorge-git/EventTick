// const express = require('express');
// const { getAllUsers } =  require('../Controllers/userController'); // Ensure correct path to controller
// const { registerUser, loginUser, getUserProfile, } = require('../Controllers/userController');
// const { protect, authorizeRoles } = require('../middleware/authorization'); // Ensure correct path to authorization middleware

// const router = express.Router();

// router.get('/profile', protect, userController.registerUser);


// // Admin route to get all users
// router.get('/', protect, authorizeRoles('admin'), getAllUsers);

// module.exports = router;

const express = require('express');
const userController = require('../Controllers/userController');  // Ensure correct path to userController
const { protect, authorizeRoles } = require('../middleware/authorization');
const { registerUser, loginUser } = require('../Controllers/userController');
const router = express.Router();

// // Register route (for user registration)
// router.post('/register', userController.registerUser);

// // Login route (for user login)
// router.post('/login', userController.loginUser);

// // Profile route (GET user profile after authentication)
// router.get('/profile', protect, userController.getUserProfile);  // This was previously incorrectly mapped to registerUser

// // Update profile route
// router.put('/profile', protect, userController.updateUserProfile);

// // Forget password route
// router.put('/forgetPassword', userController.forgetPassword);

// // Admin route to get all users
// router.get('/', protect, authorizeRoles('admin'), userController.getAllUsers);  // Admin can get all users

// module.exports = router;

// Import the userController (make sure the path is correct)
//const userController = require("../Controllers/userController");

// Define routes for login and register
router.post("/login", userController.loginUser);  // Correct handler function
router.post("/register", userController.registerUser);  // Correct handler function

module.exports = router;
