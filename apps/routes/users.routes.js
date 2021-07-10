const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Require the controllers WHICH WE DID NOT CREATE YET!!
const usersController = require('../controllers/users.controller');

// router.post('/signup', usersController.signUp);
// router.post('/signin', usersController.signIn);
router.post('/sendOTP', usersController.sendOTP);
router.post('/verifyOTP', usersController.verifyOTP);

module.exports = router;