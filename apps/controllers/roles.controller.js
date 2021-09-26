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

            return response.send({
                status: false,
                message: message
            })
        }

        let checkRole = await Role.findOne({ role_name: body.role_name });

        if (checkRole) {
            return response.send({
                status: false,
                message: "Role name is already exists in our records."
            })
        }

        // Create role
        const role = new Role(body)
        await role.save();

        if (role) {
            return response.send({
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
        console.log(error)
        return response.send({ status: false, message: "Something went wrong" })
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
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Roles found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};