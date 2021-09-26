const express = require('express');
const router = express.Router();

const countriesController = require('../../controllers/master/countries.controller');
const { createCountries } = require('../../validations/masters.validation');
const { checkToken } = require('../../middleware/auth');

router.post('/create', [checkToken, createCountries], countriesController.createCountry);
router.post('/get/all', [checkToken], countriesController.getCountriesList);

module.exports = router;