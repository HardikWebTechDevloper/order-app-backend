const City = require('../../models/cities.model');

/**
 * This function create new state.
 *
 * @param city_name
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.createCity = async function (request, response) {
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

        const city = new City(body)
        await city.save();

        if (city) {
            return response.send({
                status: true,
                message: "City has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. City has not been created."
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
exports.getCitiesList = async function (request, response) {
    try {
        let { state_id } = request.body;

        City.find({ is_active: true, state_id: state_id }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "City Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: error })
    }
};