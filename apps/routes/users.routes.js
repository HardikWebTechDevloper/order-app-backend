const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Require the controllers WHICH WE DID NOT CREATE YET!!
const usersController = require('../controllers/users.controller');
const { siginUserValidation, sendOTPValidation, getDistributorsValidation, createDistributorValidation, updateDistributorValidation, createStaffValidation, updateStaffValidation, deleteUser } = require('../validations/user.validation');

router.post('/sendOTP', [sendOTPValidation], usersController.sendOTP);
router.post('/verifyOTP', [siginUserValidation], usersController.verifyOTP);
router.post('/distributor/get', [getDistributorsValidation], usersController.getDistributors);
router.post('/distributor/create', [createDistributorValidation], usersController.createDistributor);
router.post('/distributor/update', [updateDistributorValidation], usersController.updateDistributor);
router.post('/get/all', usersController.getUsers);
router.post('/staff/create', [createStaffValidation], usersController.createStaff);
router.post('/staff/update', [updateStaffValidation], usersController.updateStaff);
router.post('/delete', [deleteUser], usersController.deleteUser);

module.exports = router;