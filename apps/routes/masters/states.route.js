const express = require('express');
const router = express.Router();

const statesController = require('../../controllers/master/states.controller');
const { createStates, getAllStatesByCountry } = require('../../validations/masters.validation');
const Authentication = require('../../middleware/auth');

router.post('/create', [createStates], statesController.createState);
router.post('/get/all', [getAllStatesByCountry], statesController.getStatesList);

module.exports = router;