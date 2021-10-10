const { Validate } = require('../middleware/validate');
const { body } = require('express-validator');

/**
 * Create Countries
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createCountries = Validate([
    body("country_name", "Country name is required").isString().escape().trim().exists().notEmpty()
]);

/**
 * Create States
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createStates = Validate([
    body("state_name", "State name is required").isString().escape().trim().exists().notEmpty(),
    body("country_id", "Country id is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Get All States
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.getAllStatesByCountry = Validate([
    body("country_id", "Country id is required").isString().escape().trim().exists().notEmpty()
]);

/**
 * Create Cities
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createCities = Validate([
    body("city_name", "City name is required").isString().escape().trim().exists().notEmpty(),
    body("state_id", "State id is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Get All Cities
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.getAllCityByState = Validate([
    body("state_id", "State id is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Create Brands
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createBrands = Validate([
    body("brand_name", "Brand name is required").isString().escape().trim().exists().notEmpty(),
    body("website", "Website is required").isString().escape().trim().exists().notEmpty(),
]);

/**
 * Create Brand Delivery Partner
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.createDeliveryPartnerValidation = Validate([
    body("brand_id", "Brand id is required").isString().trim().exists().notEmpty(),
    body("brand_user_id", "Brand user id is required").isString().trim().exists().notEmpty(),
    body("delivery_partner_name", "Partner name is required").isString().trim().exists().notEmpty(),
    body("host_name", "Host name is required").isString().trim().exists().notEmpty(),
    body("client_id", "Client id is required").isString().trim().exists().notEmpty(),
    body("client_password", "Client password is required").isString().trim().exists().notEmpty(),
]);

/**
 * Get Brand Delivery Partner
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.getDeliveryPartnerValidation = Validate([
    body("brand_id", "Brand id is required").isString().trim().exists().notEmpty()
]);

/**
 * Update Brand Delivery Partner
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
exports.updateDeliveryPartnerValidation = Validate([
    body("id", "Delivery partner id is required").isString().trim().exists().notEmpty(),
    body("api_key", "API key is required").isString().trim().exists().notEmpty(),
    body("partner_name", "Partner name is required").isString().trim().exists().notEmpty(),
    body("is_active", "Is active status is required").isBoolean().trim().exists().notEmpty()
]);