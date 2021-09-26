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

        let checkCountry = await Country.findOne({ country_name: body.country_name });

        if (checkCountry) {
            return response.send({
                status: false,
                message: "Country is already exists in our records."
            });
        }

        const country = new Country(body);
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