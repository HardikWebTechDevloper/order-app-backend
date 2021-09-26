const express = require('express');
const router = express.Router();

const citiesController = require('../../controllers/master/cities.controller');
const { createCities, getAllCityByState } = require('../../validations/masters.validation');
const { checkToken } = require('../../middleware/auth');

router.post('/create', [checkToken, createCities], citiesController.createCity);
router.post('/get/all', [checkToken, getAllCityByState], citiesController.getCitiesList);

module.exports = router;