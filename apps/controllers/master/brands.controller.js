const Brand = require('../../models/brands.model');
const DeliveryPartner = require('../../models/delivery_partners.model');

/**
 * This function create new brand.
 *
 * @param brand_name
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.createBrand = async function (request, response) {
    // Create a new Brand
    try {
        var body = request.body;

        let checkBrand = await Brand.find({
            brand_name: body.brand_name,
            is_active: true
        });

        if (checkBrand && checkBrand.length > 0) {
            return response.send({
                status: false,
                message: "Brand is already exists in our records."
            })
        }

        const brand = new Brand(body)
        await brand.save();

        if (brand) {
            return response.send({
                status: true,
                message: "Brand has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Brand has not been created."
            })
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Get all brands.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.getBrandsList = async function (request, response) {
    try {
        Brand.find({ is_active: true }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Brand Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Update brand.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-17
 */
exports.updateBrand = async function (request, response) {
    try {
        var { brand_id, brand_name, website } = request.body;

        let checkBrand = await Brand.find({
            _id: {
                $ne: brand_id
            },
            brand_name: brand_name,
            is_active: true
        });

        if (checkBrand && checkBrand.length > 0) {
            return response.send({
                status: false,
                message: "Brand is already exists in our records."
            })
        }

        Brand.updateOne({ _id: brand_id }, {
            brand_name: brand_name,
            website: website,
        }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Brand has been updated successfully.",
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * create delivery partner
 *
 * @param object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.createBrandDeliveryPartner = async function (request, response) {
    try {
        const { brand_id } = request.body;

        let checkDeliveryPartner = await DeliveryPartner.countDocuments({ brand_id });

        if (checkDeliveryPartner > 0) {
            return response.send({ status: false, message: 'Delivery partner already exists for this brand.' });
        } else {
            let deliveryPartner = new DeliveryPartner(request.body);
            await deliveryPartner.save();

            if (deliveryPartner) {
                return response.send({ status: true, message: 'Delivery partner has been saved successfully.', data: deliveryPartner });
            } else {
                return response.send({ status: false, message: 'Something went wrong saving the delivery partner.' });
            }
        }

    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Get delivery partner
 *
 * @param object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.getBrandDeliveryPartner = async function (request, response) {
    try {
        const { brand_id } = request.body;

        let deliveryPartner = await DeliveryPartner.findOne({ brand_id });

        if (deliveryPartner) {
            return response.send({ status: true, message: 'Delivery partner found.', data: deliveryPartner });
        } else {
            return response.send({ status: false, message: 'Delivery partner not found.' });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Update delivery partner
 *
 * @param object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.updateBrandDeliveryPartner = async function (request, response) {
    try {
        const { id, api_key, partner_name, is_active } = request.body;

        let updateClause = {
            api_key, partner_name
        };

        if (is_active == true) {
            updateClause.is_active = true;
        } else {
            updateClause.is_active = false;
        }

        DeliveryPartner.updateOne({ _id: id }, updateClause, function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'Something went wrong updating delivery partner.' });
            } else {
                return response.send({ status: true, message: 'Delivery partner has been updated successfully.' });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};