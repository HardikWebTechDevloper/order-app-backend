const express = require('express');
const router = express.Router();

const brandController = require('../../controllers/master/brands.controller');
const { createBrands, createDeliveryPartnerValidation, getDeliveryPartnerValidation, updateDeliveryPartnerValidation } = require('../../validations/masters.validation');
const { checkToken } = require('../../middleware/auth');

router.post('/create', [checkToken, createBrands], brandController.createBrand);
router.post('/get/all', [checkToken], brandController.getBrandsList);
router.put('/update', [checkToken], brandController.updateBrand);
router.post('/delivery/partner/manage', [checkToken, createDeliveryPartnerValidation], brandController.manageBrandDeliveryPartner);
router.post('/delivery/partner/get', [checkToken, getDeliveryPartnerValidation], brandController.getBrandDeliveryPartner);
router.post('/delivery/partner/update', [checkToken, updateDeliveryPartnerValidation], brandController.updateBrandDeliveryPartner);

module.exports = router;