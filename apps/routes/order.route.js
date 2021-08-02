const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const orderController = require('../controllers/order.controller');
const { createOrderValidation, getOrderValidation, updateOrderStatusValidation } = require('../validations/order.validation');
const Authentication = require('../middleware/auth');

// a simple test url to check that all of our files are communicating correctly.
router.post('/place', [createOrderValidation], orderController.placeOrder);
router.post('/get/by/distributor', [getOrderValidation], orderController.getOrders);
router.post('/update/status', [updateOrderStatusValidation], orderController.updateOrderStatus);

module.exports = router;