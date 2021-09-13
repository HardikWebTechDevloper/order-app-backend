const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const orderController = require('../controllers/order.controller');
const { getStaffValidation, updateOrderScheduleByDistributorValidation, createOrderValidation, getOrderValidation, updateOrderStatusValidation, brandValidation, orderValidation, verifyDeliveryOTPValidation } = require('../validations/order.validation');
const Authentication = require('../middleware/auth');

// a simple test url to check that all of our files are communicating correctly.
router.post('/place', [createOrderValidation], orderController.placeOrder);
router.post('/get/by/distributor', [getOrderValidation], orderController.getOrders);
router.post('/get/by/staff', [getStaffValidation], orderController.getStaffOrders);
router.post('/update/status', [updateOrderStatusValidation], orderController.updateOrderStatus);
router.post('/distributor/transactions/get', [], orderController.getDistributorTransactions);
router.post('/brand/get', [brandValidation], orderController.getBrandOrders);
router.post('/report', [getOrderValidation], orderController.getDistributorTotalOrders);
router.post('/send/delivery/otp', [orderValidation], orderController.sendDeliveryConfirmationOTP);
router.post('/verify/delivery/otp', [verifyDeliveryOTPValidation], orderController.verifyDeliveryOTP);
router.post('/verify/delivery/signature', orderController.verifyDeliveryBySignature);
router.post('/update/schedule/by/distributor', [updateOrderScheduleByDistributorValidation], orderController.updateOrderScheduleByDistributor);

module.exports = router;