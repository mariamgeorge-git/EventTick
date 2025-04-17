const express = require('express');
const router = express.Router();

 const { registerUser, loginUser } = require('../Controllers/userController');

//console.log('Auth routes loaded');
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;

router.get('/test', (req, res) => {
    res.send('Auth route is working 🎉');
  });
  


