const express = require('express');
const router = express.Router();

const statesController = require('../../controllers/master/states.controller');
const { createStates, getAllStatesByCountry } = require('../../validations/masters.validation');
const { checkToken } = require('../../middleware/auth');

router.post('/create', [checkToken, createStates], statesController.createState);
router.post('/get/all', [checkToken, getAllStatesByCountry], statesController.getStatesList);

module.exports = router;