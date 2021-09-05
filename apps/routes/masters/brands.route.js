const express = require('express');
const router = express.Router();

const brandController = require('../../controllers/master/brands.controller');
const { createBrands, createDeliveryPartnerValidation, getDeliveryPartnerValidation, updateDeliveryPartnerValidation } = require('../../validations/masters.validation');
const Authentication = require('../../middleware/auth');

router.post('/create', [createBrands], brandController.createBrand);
router.post('/get/all', brandController.getBrandsList);  
router.put('/update', brandController.updateBrand);  
router.post('/delivery/partner/manage', [createDeliveryPartnerValidation], brandController.manageBrandDeliveryPartner);
router.post('/delivery/partner/get', [getDeliveryPartnerValidation], brandController.getBrandDeliveryPartner);
router.post('/delivery/partner/update', [updateDeliveryPartnerValidation], brandController.updateBrandDeliveryPartner);

module.exports = router;