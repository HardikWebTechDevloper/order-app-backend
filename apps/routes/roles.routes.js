const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const rolesController = require('../controllers/roles.controller');
const { checkToken } = require('../middleware/auth');

// a simple test url to check that all of our files are communicating correctly.
router.post('/create', [checkToken], rolesController.createRole);
router.post('/get/all', [checkToken], rolesController.getRoles);

module.exports = router;