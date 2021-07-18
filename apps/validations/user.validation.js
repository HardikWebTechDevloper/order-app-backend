const { Validate } = require('../middleware/validate');
const { body } = require('express-validator');

/**
 * Send OTP
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.sendOTPValidation = Validate([
    body("phone", "Phone number is required").isString().escape().trim().exists().notEmpty()
]);

/**
 * Signin with Phone and OTP
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} user object
 */
exports.siginUserValidation = Validate([
    body("phone", "Phone number is required").isInt().escape().trim().exists().notEmpty()
        .matches(/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/).withMessage("Please enter valid phone number"),
    body("otp", "OTP is required").isInt().escape().trim().exists().notEmpty(),
]);

/**
 * Create Distributor
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} user object
 */
exports.createDistributorValidation = Validate([
    body("phone", "Phone number is required").isInt().escape().trim().exists().notEmpty()
        .matches(/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/).withMessage("Please enter valid phone number"),
    body("email", "Email is required").isString().escape().trim().exists().notEmpty().isEmail(),
    body("first_name", "First name is required").isString().escape().trim().exists().notEmpty(),
    body("last_name", "Last name is required").isString().escape().trim().exists().notEmpty(),
    body("role_id", "Role id is required").isString().escape().trim().exists().notEmpty(),
    body("city_id", "City id is required").isString().escape().trim().exists().notEmpty(),
    body("state_id", "State id is required").isString().escape().trim().exists().notEmpty(),
    body("country_id", "Country id is required").isString().escape().trim().exists().notEmpty(),
    body("pin_code", "Pin code is required").isString().escape().trim().exists().notEmpty(),
    body("distributor_commision", "Distributor commision is required").isInt().escape().trim().exists().notEmpty(),
    body("distributor_tax_details", "Distributor tax details is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Edit Distributor
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object} user object
 */
exports.updateDistributorValidation = Validate([
    body("user_id", "User id is required").isString().escape().trim().exists().notEmpty(),
    body("first_name", "First name is required").isString().escape().trim().exists().notEmpty(),
    body("last_name", "Last name is required").isString().escape().trim().exists().notEmpty(),
    body("city_id", "City id is required").isString().escape().trim().exists().notEmpty(),
    body("state_id", "State id is required").isString().escape().trim().exists().notEmpty(),
    body("country_id", "Country id is required").isString().escape().trim().exists().notEmpty(),
    body("pin_code", "Pin code is required").isString().escape().trim().exists().notEmpty(),
    body("distributor_commision", "Distributor commision is required").isInt().escape().trim().exists().notEmpty(),
    body("distributor_tax_details", "Distributor tax details is required").isString().escape().trim().exists().notEmpty(),
]);