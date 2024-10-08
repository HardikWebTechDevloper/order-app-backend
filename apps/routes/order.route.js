const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const { getStaffValidation, updateOrderScheduleByDistributorValidation, createOrderValidation, getOrderValidation, updateOrderStatusValidation, brandValidation, orderValidation, verifyDeliveryOTPValidation } = require('../validations/order.validation');
const { checkToken } = require('../middleware/auth');

router.post('/place', orderController.placeOrder);
router.get('/place/direct', orderController.placeOrderV2);
router.post('/update/details', orderController.updateOrder);
router.post('/cancel', orderController.cancelOrder);
router.post('/get/by/distributor', [checkToken, getOrderValidation], orderController.getOrders);
router.post('/get/by/staff', [checkToken, getStaffValidation], orderController.getStaffOrders);
router.post('/update/status', [checkToken, updateOrderStatusValidation], orderController.updateOrderStatus);
router.post('/distributor/transactions/get', [checkToken], orderController.getDistributorTransactions);
router.post('/brand/get', [checkToken, brandValidation], orderController.getBrandOrders);
router.post('/report', [checkToken, getOrderValidation], orderController.getDistributorTotalOrders);
router.post('/brand/report', [brandValidation], orderController.getBrandOrderReports);
router.post('/send/delivery/otp', [checkToken, orderValidation], orderController.sendDeliveryConfirmationOTP);
router.post('/verify/delivery/otp', [checkToken, verifyDeliveryOTPValidation], orderController.verifyDeliveryOTP);
router.post('/verify/delivery/signature', [checkToken], orderController.verifyDeliveryBySignature);
router.post('/update/schedule/by/distributor', [checkToken, updateOrderScheduleByDistributorValidation], orderController.updateOrderScheduleByDistributor);

module.exports = router;