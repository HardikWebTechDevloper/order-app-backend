const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const orderController = require('../controllers/order.controller');
const Authentication = require('../middleware/auth');

// a simple test url to check that all of our files are communicating correctly.
router.post('/place', orderController.placeOrder);

module.exports = router;