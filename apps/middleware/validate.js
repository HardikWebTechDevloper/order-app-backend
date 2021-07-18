const { validationResult } = require('express-validator');

const errorMessage = { status: false };
const status = {
    success: 200,
    error: 500,
    notfound: 404,
    unauthorized: 401,
    conflict: 409,
    created: 201,
    bad: 400,
    nocontent: 204,
};

const Validate = validations => {
    return async (req, res, next) => {

        await Promise.all(validations.map(validation => validation.run(req)));
        const error = validationResult(req);
        if (!error.isEmpty()) {
            let result = error.array();

            errorMessage.message = result[0].msg;
            return res.status(status.bad).send(errorMessage);
        } else {
            next();
        }
    }
}

module.exports.Validate = Validate;