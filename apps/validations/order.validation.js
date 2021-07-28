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
    body("deliver_by", "Deliver by is required").isString().escape().trim().exists().notEmpty(),
    body("pincode", "Pincode is required").isString().escape().trim().exists().notEmpty(),
    body("order_details", "Order details is required").isString().escape().trim().exists().notEmpty()
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