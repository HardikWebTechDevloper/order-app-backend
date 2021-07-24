const express = require('express');
const router = express.Router();

const brandController = require('../../controllers/master/brands.controller');
const { createBrands } = require('../../validations/masters.validation');
const Authentication = require('../../middleware/auth');

router.post('/create', [createBrands], brandController.createBrand);
router.post('/get/all', brandController.getBrandsList);  
router.put('/update', brandController.updateBrand);  

module.exports = router;