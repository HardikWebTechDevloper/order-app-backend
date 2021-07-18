const express = require('express');
const router = express.Router();

const citiesController = require('../../controllers/master/cities.controller');
const { createCities, getAllCityByState } = require('../../validations/masters.validation');
const Authentication = require('../../middleware/auth');

router.post('/create', [createCities], citiesController.createCity);
router.post('/get/all', [getAllCityByState], citiesController.getCitiesList);

module.exports = router;