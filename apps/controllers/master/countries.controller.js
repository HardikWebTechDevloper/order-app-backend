const Country = require('../../models/countries.model');

/**
 * This function create new country.
 *
 * @param country_name
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.createCountry = async function (request, response) {
    // Create a new Country
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

        const country = new Country(body)
        await country.save();

        if (country) {
            return response.send({
                status: true,
                message: "Country has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Country has not been created."
            })
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Get all countries.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.getCountriesList = async function (request, response) {
    try {
        Country.find({ is_active: true }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Country Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};