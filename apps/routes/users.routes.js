const express = require('express');
const router = express.Router();
const { checkToken } = require('../middleware/auth');

const usersController = require('../controllers/users.controller');
const { siginUserValidation, sendOTPValidation, getDistributorsValidation, createDistributorValidation, updateDistributorValidation, getStaffValidation, createStaffValidation, updateStaffValidation, deleteUser } = require('../validations/user.validation');

router.post('/sendOTP', [sendOTPValidation], usersController.sendOTP);
router.post('/verifyOTP', [siginUserValidation], usersController.verifyOTP);
router.post('/distributor/get', [checkToken, getDistributorsValidation], usersController.getDistributors);
router.post('/distributor/create', [checkToken, createDistributorValidation], usersController.createDistributor);
router.post('/distributor/update', [checkToken, updateDistributorValidation], usersController.updateDistributor);
router.post('/get/all', [checkToken], usersController.getUsers);
router.post('/staff/create', [checkToken, createStaffValidation], usersController.createStaff);
router.post('/staff/get', [checkToken, getStaffValidation], usersController.getStaffList);
router.post('/staff/update', [checkToken, updateStaffValidation], usersController.updateStaff);
router.post('/delete', [checkToken, deleteUser], usersController.deleteUser);
router.post('/get/by/id', [checkToken, deleteUser], usersController.getUserById);
router.post('/get/pincodes', [checkToken, deleteUser], usersController.getDistributorPincodes);

module.exports = router;