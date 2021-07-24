const express = require('express');
const router = express.Router();

const user = require('../routes/users.routes');
const roles = require('../routes/roles.routes');
const countries = require('../routes/masters/countries.route');
const states = require('../routes/masters/states.route');
const cities = require('../routes/masters/cities.route');
const brands = require('../routes/masters/brands.route');

//Routes
router.get('/', (request, response) => {
    return response.send({ message: "Welcome to OrderApp API." })
});

router.use('/user', user);
router.use('/role', roles);
router.use('/country', countries);
router.use('/state', states);
router.use('/city', cities);
router.use('/brand', brands);

module.exports = router;

