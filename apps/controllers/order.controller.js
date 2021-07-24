const State = require('../../models/states.model');

/**
 * This function create new state.
 *
 * @param state_name
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.createState = async function (request, response) {
    // Create a new state
    try {
        var body = request.body;
        var errors = [];

        if (errors && errors.length > 0) {
            var message = errors.join(', ');

            return response.send({
                status: false,
                message: message
            })
        }

        const state = new State(body)
        await state.save();

        if (state) {
            return response.send({
                status: true,
                message: "State has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. State has not been created."
            })
        }
    } catch (error) {
        return response.send({ status: false, message: error })
    }
};

/**
 * Get all states.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.getStatesList = async function (request, response) {
    try {
        let { country_id } = request.body;

        State.find({ is_active: true, country_id: country_id }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "State Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: error })
    }
};