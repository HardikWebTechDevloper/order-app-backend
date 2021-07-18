const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Require the controllers WHICH WE DID NOT CREATE YET!!
const usersController = require('../controllers/users.controller');
const { siginUserValidation, sendOTPValidation, createDistributorValidation, updateDistributorValidation } = require('../validations/user.validation');

router.post('/sendOTP', [sendOTPValidation], usersController.sendOTP);
router.post('/verifyOTP', [siginUserValidation], usersController.verifyOTP);
router.post('/distributor/create', [createDistributorValidation], usersController.createDistributor);
router.post('/distributor/update', [updateDistributorValidation], usersController.updateDistributor);
router.post('/get/all', usersController.getUsers);

module.exports = router;