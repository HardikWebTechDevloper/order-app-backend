const express = require('express');
const router = express.Router();

const countriesController = require('../../controllers/master/countries.controller');
const { createCountries } = require('../../validations/masters.validation');
const Authentication = require('../../middleware/auth');

router.post('/create', [createCountries], countriesController.createCountry);
router.post('/get/all', countriesController.getCountriesList);

module.exports = router;