'use strict';
const express = require('express');
const router = express.Router();
const pluralize = require('pluralize');
const path = require('path');

pluralize.addUncountableRule('media');
pluralize.addUncountableRule('auth');

const { HttpError } = require('../helpers/HttpError');
const packageJson = require('../../package.json');

router.get('/', (req, res) => {
    res.json({ 'status': true, 'message': `Welcome to ${packageJson.name} V ${packageJson.version}` });
});

router.use('*', (req, res, next) => {
    // 404 handler
    const error = new Error('Resource not found');

    error.statusCode = 404;
    next(error);
});

router.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(req.method, req.url, err.statusCode, err.message);
    }
    const error = new HttpError(err);

    res.status(error.statusCode);
    res.json(error);
    next();
});

module.exports = router;
