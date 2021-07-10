const Role = require('../models/roles.model');

/**
 * This function create new role.
 *
 * @param title, description, author
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.createRole = async function (request, response) {
    // Create a new Role
    try {
        var body = request.body;
        var errors = [];

        if (!body.role_name) {
            errors.push(['Role name is required']);
        }

        if (errors && errors.length > 0) {
            var message = errors.join(', ');

            return response.status(400).send({
                status: false,
                message: message
            })
        }

        const role = new Role(body)
        await role.save();

        if (role) {
            return response.status(201).send({
                status: true,
                message: "Role has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Role has not been created."
            })
        }
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

/**
 * Get all roles.
 *
 * @param title, description, author
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-10
 */
exports.getRoles = async function (request, response) {
    try {
        Role.find({}, function (err, data) {
            if (err) {
                return response.status(404).send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(404).send({
                    status: true,
                    message: "Roles founded.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};