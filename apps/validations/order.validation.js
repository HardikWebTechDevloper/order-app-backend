const { Validate } = require('../middleware/validate');
const { body } = require('express-validator');

/**
 * Create Order
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createOrderValidation = Validate([
    body("amount", "Amount is required").isInt().escape().trim().exists().notEmpty(),
    body("pincode", "Pincode is required").isString().escape().trim().exists().notEmpty(),
    body("order_details", "Order details is required").exists().notEmpty()
]);

/**
 * Get Orders
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.getOrderValidation = Validate([
    body("distributor_id", "Distributor id is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Update Order Status
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.updateOrderStatusValidation = Validate([
    body("order_id", "Order id is required").isString().escape().trim().exists().notEmpty(),
    body("order_status", "Order status is required").isString().escape().trim().exists().notEmpty(),
]);

exports.brandValidation = Validate([
    body("brand_user_id", "Brand user id is required").isString().escape().trim().exists().notEmpty(),
]);

exports.orderValidation = Validate([
    body("order_id", "Order id is required").isString().escape().trim().exists().notEmpty(),
]);

exports.verifyDeliveryOTPValidation = Validate([
    body("order_id", "Order id is required").isString().escape().trim().exists().notEmpty(),
    body("order_otp", "Order id is required").isInt().escape().trim().exists().notEmpty(),
]);