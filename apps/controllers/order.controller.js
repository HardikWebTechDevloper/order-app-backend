const mongoose = require('mongoose');
const moment = require('moment');
const asyncL = require('async');

const path = require("path");
const fs = require('fs');
const formidable = require('formidable');

const CommonHelper = require('../helpers/common.helper');
const {
    createOrderDeliveryInDunzo,
    getOrderById,
    getFullfillmentOrderById,
    updateOrderDeliverStatus,
    updateShopifyOrderTags,
    getOrderTransactionById,
    checkOrderCODStatus,
    getAttachmentURL
} = CommonHelper;

const Order = require('../models/orders.model');
const UnConfirmedOrder = require('../models/unconfirmed_orders.controller');
const User = require('../models/user.model');
const Role = require('../models/roles.model');
const Transaction = require('../models/transactions.model');
const DistributorPincode = require('../models/distributor_pincodes.model');
const DeliveryPartners = require('../models/delivery_partners.model');

/**
 * create new order
 *
 * @param amount, pincode, order_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-26
 */
// exports.placeOrder = async (request, response) => {
//     try {
//         var { amount, pincode, order_details } = request.body;
//         order_details = JSON.stringify(order_details);

//         // Find distributor using pincode
//         let distributor = await DistributorPincode.findOne({ pin_code: pincode });

//         if (!distributor) {
//             return response.send({
//                 status: false,
//                 message: "Distributor not found."
//             })
//         }

//         let distributor_id = distributor.distributor_id;

//         let createOrderObj = {
//             amount,
//             pincode,
//             order_details,
//             distributor_id
//         };

//         const order = new Order(createOrderObj)
//         await order.save();

//         if (order) {
//             return response.send({
//                 status: true,
//                 message: "Order has been created successfully."
//             });
//         } else {
//             return response.send({
//                 status: false,
//                 message: "Something went wrong. Order has not been created."
//             });
//         }
//     } catch (error) {
//         return response.send({ status: false, message: "Something went wrong.", error })
//     }
// };

/**
 * create new order v2
 *
 * @param amount, pincode, order_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-26
 */
exports.placeOrder = async (request, response) => {
    try {
        let orderInfo = request.body;

        let pincode = orderInfo.shipping_address.zip;
        let tags = orderInfo.tags;
        let financial_status = orderInfo.financial_status;
        let order_id = orderInfo.id;
        let order_details = JSON.stringify(orderInfo);
        let orderDateTime = (orderInfo.created_at) ? moment(orderInfo.created_at).format("YYYY-MM-DD HH:mm:ss") : moment().format("YYYY-MM-DD HH:mm:ss");

        if (!order_id) {
            return response.send({
                status: false,
                message: "Order id can not be empty.",
            });
        }

        // Check order
        let checkOrder = await Order.findOne({ order_no: order_id });

        if (checkOrder) {
            return response.send({
                status: false,
                message: "Order is already exists in our records.",
            });
        }

        // Find distributor using pincode
        let distributor = await DistributorPincode.findOne({ pin_code: pincode });

        if (!distributor) {
            return response.send({
                status: false,
                message: "Distributor has not been found."
            })
        }

        // Payment Mode
        let payment_mode;

        if (financial_status == 'pending') {
            payment_mode = "cod";
        } else if (financial_status == 'paid') {
            payment_mode = "prepaid";
        }

        if (tags == "✅ Confirmed-CODfirm") {
            let distributor_id = distributor.distributor_id;

            let createOrderObj = {
                order_datetime: orderDateTime,
                amount: orderInfo.total_outstanding,
                pincode: pincode,
                order_details,
                distributor_id,
                order_no: order_id,
                payment_mode: payment_mode,
            };

            const order = new Order(createOrderObj)
            await order.save();

            if (order) {
                return response.send({
                    status: true,
                    message: "Order has been created successfully."
                });
            } else {
                return response.send({
                    status: false,
                    message: "Something went wrong. Order has not been created."
                });
            }
        } else {
            // Check order
            let checkOrder = await UnConfirmedOrder.findOne({ order_no: order_id });

            if (!checkOrder) {
                // UnConfirmedOrders
                let unconfirmedOrderObj = {
                    order_no: order_id,
                    payment_mode,
                    pincode,
                    order_details,
                    order_datetime: orderInfo.created_at,
                };

                const unconfirmed_order = new UnConfirmedOrder(unconfirmedOrderObj)
                await unconfirmed_order.save();

                if (unconfirmed_order) {
                    return response.send({
                        status: true,
                        message: "Order has been created successfully."
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Order has not been created."
                    });
                }
            } else {
                return response.send({
                    status: false,
                    message: "Order is already exists in our records.",
                });
            }
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong.", error })
    }
};

/**
 * create new order v2
 *
 * @param amount, pincode, order_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-26
 */
exports.placeOrderV2 = async (request, response) => {
    try {
        var { order_id } = request.query;

        if (!order_id) {
            return response.send({
                status: false,
                message: "Order id can not be empty.",
            });
        }

        // Check order
        let checkOrder = await Order.findOne({ order_no: order_id });

        if (checkOrder) {
            return response.send({
                status: false,
                message: "Order is already exists in our records.",
            });
        }

        getOrderById(order_id).then(async (orderResult) => {
            if (orderResult.response && orderResult.response.data && orderResult.response.data.errors) {
                return response.send({
                    status: false,
                    message: orderResult.response.data.errors,
                });
            } else {
                let orderInfo = orderResult.order;

                let order_details = JSON.stringify(orderInfo);
                let pincode = orderInfo.shipping_address.zip;
                let tags = orderInfo.tags;
                let financial_status = orderInfo.financial_status;
                let orderDateTime = (orderInfo.created_at) ? moment(orderInfo.created_at).format("YYYY-MM-DD HH:mm:ss") : moment().format("YYYY-MM-DD HH:mm:ss");

                // Find distributor using pincode
                let distributor = await DistributorPincode.findOne({ pin_code: pincode });

                if (!distributor) {
                    return response.send({
                        status: false,
                        message: "Distributor has not been found."
                    })
                }

                // Payment Mode
                let payment_mode;

                if (financial_status == 'pending') {
                    payment_mode = "cod";
                } else if (financial_status == 'paid') {
                    payment_mode = "prepaid";
                }

                if (tags && tags == "✅ Confirmed-CODfirm") {
                    let distributor_id = distributor.distributor_id;

                    let createOrderObj = {
                        order_datetime: orderDateTime,
                        amount: orderInfo.total_outstanding,
                        pincode: pincode,
                        order_details,
                        distributor_id,
                        order_no: order_id,
                        payment_mode: payment_mode
                    };

                    const order = new Order(createOrderObj)
                    await order.save();

                    if (order) {
                        return response.send({
                            status: true,
                            message: "Order has been created successfully."
                        });
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong. Order has not been created."
                        });
                    }
                } else {

                    // Check order
                    let checkOrder = await UnConfirmedOrder.findOne({ order_no: order_id });

                    if (checkOrder) {
                        return response.send({
                            status: false,
                            message: "Order is already exists in our records.",
                        });
                    }

                    // UnConfirmedOrders
                    let unconfirmedOrderObj = {
                        order_no: order_id,
                        payment_mode,
                        pincode,
                        order_details,
                        order_datetime: orderInfo.created_at,
                    };

                    const unconfirmed_order = new UnConfirmedOrder(unconfirmedOrderObj)
                    await unconfirmed_order.save();

                    if (unconfirmed_order) {
                        return response.send({
                            status: true,
                            message: "Order has been created successfully."
                        });
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong. Order has not been created."
                        });
                    }
                }
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong.", error })
    }
};

exports.updateOrder = async (request, response) => {
    try {
        let orderInfo = request.body;
        let order_id = orderInfo.id;

        getOrderById(order_id).then(async (orderResult) => {
            if (orderResult && orderResult.order) {
                let orderInfo = orderResult.order;
                let tags = orderInfo.tags;
                let orderDateTime = (orderInfo.created_at) ? moment(orderInfo.created_at).format("YYYY-MM-DD HH:mm:ss") : moment().format("YYYY-MM-DD HH:mm:ss");

                if (tags && tags == "✅ Confirmed-CODfirm") {
                    let order_details = JSON.stringify(orderInfo);
                    let pincode = orderInfo.shipping_address.zip;
                    let financial_status = orderInfo.financial_status;

                    // Find distributor using pincode
                    let distributor = await DistributorPincode.findOne({ pin_code: pincode });

                    if (distributor) {
                        // Payment Mode
                        let payment_mode;

                        if (financial_status == 'pending') {
                            payment_mode = "cod";
                        } else if (financial_status == 'paid') {
                            payment_mode = "prepaid";
                        }

                        let distributor_id = distributor.distributor_id;

                        let orderObj = {
                            order_datetime: orderDateTime,
                            amount: orderInfo.total_outstanding,
                            pincode: pincode,
                            order_details,
                            distributor_id,
                            order_no: order_id,
                            payment_mode: payment_mode
                        };

                        // Check order details
                        let order = await Order.findOne({ order_no: order_id });

                        if (order) {
                            Order.updateOne({ order_no: order_id }, orderObj, async function (err, data) {
                                if (err) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong. Order status has not been updated."
                                    })
                                } else {
                                    return response.send({ status: true, message: "Order has been updated successfully." });
                                }
                            });
                        } else {
                            const order = new Order(orderObj)
                            await order.save();

                            // Remove record
                            await UnConfirmedOrder.remove({ order_no: order_id });

                            return response.send({ status: true, message: "Order has been placed successfully." });
                        }
                    } else {
                        return response.send({ status: false, message: "Distributor has not been found." });
                    }
                } else {
                    return response.send({ status: false, message: "Order has not been confirmed yet." });
                }
            }
        });
    } catch (err) {
        return response.send({ status: false, message: "Something went wrong.", err })
    }
};

/**
 * Order CRON.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-16
 */
exports.checkUnConfirmedOrders = async () => {
    try {
        console.log("✅ ORDER CRON STARTED:: ", moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss"));

        let getOrders = await UnConfirmedOrder.find({}, { order_no: 1 });

        if (getOrders && getOrders.length > 0) {
            asyncL.each(getOrders, (order, callback) => {
                let order_id = order.order_no;
                getOrderById(order_id).then(async (orderResult) => {
                    if (orderResult && orderResult.order) {
                        let orderInfo = orderResult.order;
                        let tags = orderInfo.tags;

                        if (tags && tags == "✅ Confirmed-CODfirm") {
                            let order_details = JSON.stringify(orderInfo);
                            let pincode = orderInfo.shipping_address.zip;
                            let financial_status = orderInfo.financial_status;

                            // Find distributor using pincode
                            let distributor = await DistributorPincode.findOne({ pin_code: pincode });

                            if (distributor) {
                                // Payment Mode
                                let payment_mode;

                                if (financial_status == 'pending') {
                                    payment_mode = "cod";
                                } else if (financial_status == 'paid') {
                                    payment_mode = "prepaid";
                                }

                                let distributor_id = distributor.distributor_id;

                                let createOrderObj = {
                                    amount: orderInfo.total_outstanding,
                                    pincode: pincode,
                                    order_details,
                                    distributor_id,
                                    order_no: order_id,
                                    payment_mode: payment_mode
                                };

                                const order = new Order(createOrderObj)
                                await order.save();

                                // Remove record
                                await UnConfirmedOrder.remove({ order_no: order_id });

                                callback();
                            } else {
                                await UnConfirmedOrder.remove({ order_no: order_id });
                                callback();
                            }
                        } else {
                            callback();
                        }
                    }
                });
            }, (err) => {
                console.log("ORDER CRON END:: ", moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss"));
            });
        }
    } catch (error) {
        console.log("Error", error);
    }
}

/**
 * Get orders.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-28
 */
exports.getOrders = async (request, response) => {
    try {
        let { distributor_id, order_status, start_date, end_date } = request.body;
        let whereClause = { distributor_id };

        if (order_status) {
            whereClause.order_status = order_status;
        }

        if (start_date && end_date) {
            start_date = moment(start_date).utcOffset("+05:30").format("YYYY-MM-DD");
            end_date = moment(end_date).utcOffset("+05:30").format("YYYY-MM-DD");

            let startDate = `${start_date}T00:00:00.000Z`;
            let endDate = `${end_date}T23:59:59.000Z`;

            whereClause.order_datetime = {
                $gte: startDate,
                $lt: endDate
            };
        }

        Order.find(whereClause, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (data && data.length > 0) {
                    data = JSON.parse(JSON.stringify(data));

                    data = data.map(element => {
                        let orderDetails = element.order_details;
                        delete element.order_details;
                        element.order_details = JSON.parse(orderDetails);
                        return element;
                    });
                }
                return response.send({
                    status: true,
                    message: "Order Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Get orders.
 *
 * @param staff_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-28
 */
exports.getStaffOrders = async (request, response) => {
    try {
        let { staff_id, order_status } = request.body;
        let whereClause = { staff_id };

        if (order_status) {
            whereClause.order_status = order_status;
        }

        Order.find(whereClause, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (data && data.length > 0) {
                    data = JSON.parse(JSON.stringify(data));

                    data = data.map(element => {
                        let orderDetails = element.order_details;
                        delete element.order_details;
                        element.order_details = JSON.parse(orderDetails);
                        return element;
                    });
                }
                return response.send({
                    status: true,
                    message: "Order Found.",
                    data: data
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Accept Order.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-28
 */
exports.updateOrderStatus = async (request, response) => {
    try {
        let { order_id, order_status, deliver_by, staff_user_id } = request.body;
        let currentDateTime = moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");

        let order = await Order.findOne({ _id: order_id });

        if (!order) {
            return response.send({
                status: false,
                message: "Order has not been found."
            })
        }

        let order_no = order.order_no;

        let updateObj = {
            order_status: order_status,
            status_updated_at: currentDateTime
        };

        if (order_status === 'ACCEPTED') {
            let order_tag = "Accepted By Distributor";

            if (!deliver_by) {
                return response.send({
                    status: false,
                    message: "Deliver by is required"
                })
            }

            if (deliver_by == 'SELF') {
                if (!staff_user_id) {
                    return response.send({
                        status: false,
                        message: "Staff user id is required"
                    })
                }

                updateObj.deliver_by = deliver_by;
                updateObj.staff_id = staff_user_id;

                Order.updateOne({ _id: order_id }, updateObj, async function (err, data) {
                    if (err) {
                        return response.send({
                            status: false,
                            message: "Something went wrong. Order status has not been updated."
                        })
                    } else {
                        let actionName = order_status.toLowerCase();

                        // Update status in shopify side
                        await exports.updateOrderTags(order_no, order_tag);

                        return response.send({
                            status: true,
                            message: "Order has been " + actionName + " successfully."
                        })
                    }
                });
            } else if (deliver_by == 'DUNZO') {
                let distributor_id = order.distributor_id;

                let distributor = await User.findOne({ _id: distributor_id }, { brand_user_id: 1 });

                if (!distributor && !distributor.brand_user_id) {
                    return response.send({
                        status: false,
                        message: "Distributor has not been found."
                    })
                }

                let deliveryPartner = await DeliveryPartners.findOne(
                    { brand_user_id: distributor.brand_user_id },
                    {
                        host_name: 1,
                        client_id: 1,
                        client_password: 1,
                    }
                );

                if (!deliveryPartner) {
                    return response.send({
                        status: false,
                        message: "Delivery partner has not been found. Please setup delivery partner and try again.",
                    })
                }

                // Verfiy Delivery Partner
                let { host_name, client_id, client_password } = deliveryPartner;

                let { pickup_location, drop_location } = request.body;
                let deliveryDateTime = moment().utcOffset("+05:30").add(1, 'hour').format("YYYY-MM-DD HH:mm:ss");

                let expected_delivery_time = (order.expected_delivery_time) ?
                    moment(order.expected_delivery_time).utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss") :
                    deliveryDateTime;
                let unixTime = moment(expected_delivery_time).unix();

                // GENERATE DUNZO TOKEN
                await CommonHelper.verfiyDeliveryPartner(host_name, client_id, client_password).then(async (data) => {
                    if (data && data.token) {
                        let token = data.token;
                        let reference_id = moment().utcOffset("+05:30").unix();

                        // CREATE TASK IN DUNZO
                        let locationObj = {
                            "request_id": order_id,
                            "reference_id": `${order_id}-${reference_id}`,
                            "pickup_details": [
                                {
                                    "reference_id": "pick_ref_1",
                                    "address": pickup_location
                                }
                            ],
                            "optimised_route": true,
                            "drop_details": [
                                {
                                    "reference_id": "drop_ref_1",
                                    "address": drop_location,
                                    "otp_required": true,
                                    "special_instructions": ""
                                }
                            ],
                            "payment_method": "DUNZO_CREDIT",
                            "delivery_type": "SCHEDULED",
                            "schedule_time": parseInt(unixTime)
                        };

                        // CREATE TASK
                        await createOrderDeliveryInDunzo(client_id, host_name, token, locationObj).then(result => {
                            if (result.code) {
                                return response.send({
                                    status: false,
                                    message: result.message
                                })
                            } else {
                                let delivery_details = result;
                                delivery_details = JSON.stringify(delivery_details);

                                let address_details = JSON.stringify(locationObj);

                                let orderObj = {
                                    delivery_details,
                                    order_status,
                                    deliver_by,
                                    address_details
                                };

                                // Update address, delivery details and order status
                                Order.updateOne({ _id: order_id }, orderObj, async function (err, data) {
                                    if (err) {
                                        return response.send({
                                            status: false,
                                            message: "Something went wrong. Order status has not been updated."
                                        })
                                    } else {
                                        let actionName = order_status.toLowerCase();

                                        // Update status in shopify side
                                        await exports.updateOrderTags(order_no, order_tag);

                                        return response.send({
                                            status: true,
                                            message: "Order has been " + actionName + " successfully."
                                        })
                                    }
                                });
                            }
                        }).catch(error => {
                            return response.send({
                                status: false,
                                message: "Something went wrong with generate token."
                            })
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong with generate token."
                        })
                    }
                });
            }
        } else {
            Order.updateOne({ _id: order_id }, updateObj, async function (err, data) {
                if (err) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Order status has not been updated."
                    })
                } else {
                    let actionName = order_status.toLowerCase();

                    if (order_status == "REJECTED") {
                        // Update status in shopify side
                        await exports.updateOrderTags(order_no, "Cancelled By Distributor");
                    }

                    if (order_status == "RETURN") {
                        // Update status in shopify side
                        await exports.updateOrderTags(order_no, "RTO, RTO by Distributor");
                    }

                    return response.send({
                        status: true,
                        message: "Order has been " + actionName + " successfully."
                    });
                }
            });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * List Distributo Transactions.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-28
 */
exports.getDistributorTransactions = async (request, response) => {
    try {
        let { distributor_id, brand_user_id, start_date, end_date } = request.body;

        let whereClause = {
            distributor_id: distributor_id
        };

        if (start_date && end_date) {
            start_date = moment(start_date).utcOffset("+05:30").format("YYYY-MM-DD");
            end_date = moment(end_date).utcOffset("+05:30").format("YYYY-MM-DD");

            let startDate = `${start_date}T00:00:00.000Z`;
            let endDate = `${end_date}T23:59:59.000Z`;

            whereClause.created_at = {
                $gte: startDate,
                $lt: endDate
            };
        }


        if (distributor_id) {
            Transaction.find(whereClause, function (err, raws) {
                if (err) {
                    return response.send({
                        status: false,
                        message: "Transaction not found.",
                    })
                } else {
                    let results = [];

                    if (raws && raws.length > 0) {
                        raws.forEach(data => {
                            let element = {};
                            let distributor = data.distributor_id;
                            let distributor_name = `${distributor.first_name} ${distributor.last_name}`;
                            let distributor_id = distributor._id;

                            element._id = data._id;
                            element.order_id = data.order_id;
                            element.type = data.type;
                            element.amount = data.amount;
                            element.distributor_name = distributor_name;
                            element.distributor_id = distributor_id;
                            element.created_at = data.created_at;
                            element.updated_at = data.updated_at;

                            results.push(element);
                        });
                    }

                    return response.send({
                        status: true,
                        message: "Transaction found.",
                        data: results
                    })
                }
            })
                .sort({ created_at: -1 })
                .populate('distributor_id');
        } else {
            User.find({ brand_user_id: brand_user_id }, { _id: 1 }, function (err, data) {
                if (err) {
                    return response.send({
                        status: false,
                        message: "Distributor has not been found.",
                    })
                } else {
                    let distributors = data.map(user => user._id);
                    let whereClause = {
                        distributor_id: distributors,
                    };

                    if (start_date && end_date) {
                        start_date = moment(start_date).utcOffset("+05:30").format("YYYY-MM-DD");
                        end_date = moment(end_date).utcOffset("+05:30").format("YYYY-MM-DD");

                        let startDate = `${start_date}T00:00:00.000Z`;
                        let endDate = `${end_date}T23:59:59.000Z`;

                        whereClause.created_at = {
                            $gte: startDate,
                            $lt: endDate
                        };
                    }

                    Transaction
                        .find(whereClause)
                        .sort({ created_at: -1 })
                        .populate('distributor_id')
                        .exec(function (err, raws) {
                            if (err) {
                                return response.send({
                                    status: false,
                                    message: "Transaction not found.",
                                })
                            } else {
                                let results = [];

                                if (raws && raws.length > 0) {
                                    raws.forEach(data => {
                                        let element = {};
                                        let distributor = data.distributor_id;
                                        let distributor_name = `${distributor.first_name} ${distributor.last_name}`;
                                        let distributor_id = distributor._id;

                                        element._id = data._id;
                                        element.order_id = data.order_id;
                                        element.type = data.type;
                                        element.amount = data.amount;
                                        element.distributor_name = distributor_name;
                                        element.distributor_id = distributor_id;
                                        element.created_at = data.created_at;
                                        element.updated_at = data.updated_at;

                                        results.push(element);
                                    });
                                }

                                return response.send({
                                    status: true,
                                    message: "Transaction found.",
                                    data: results
                                })
                            }
                        });
                }
            });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * List Brand Orders.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-08-28
 */
exports.getBrandOrders = async (request, response) => {
    try {
        let { brand_user_id, distributor_ids } = request.body;

        User.find({ brand_user_id: brand_user_id }, { _id: 1 }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Distributor has not been found.",
                })
            } else {
                let whereClause = {};

                if (distributor_ids && distributor_ids.length > 0) {
                    whereClause.distributor_id = distributor_ids;
                } else {
                    let distributors = data.map(user => user._id);
                    whereClause.distributor_id = distributors;
                }

                Order.find(whereClause, function (err, orders) {
                    if (err) {
                        return response.send({
                            status: false,
                            message: "Orders has not been found.",
                        })
                    } else {
                        var apiUrl = await getAttachmentURL();

                        console.log("apiUrl", apiUrl);

                        orders = orders.map(data => {
                            if (data.customer_signature_attachment) {
                                data.customer_signature_attachment = apiUrl + data.customer_signature_attachment;
                            } else {
                                data.customer_signature_attachment = null;
                            }

                            return data;
                        });

                        return response.send({
                            status: true,
                            message: "Orders found.",
                            data: orders
                        })
                    }
                }).sort({ order_datetime: -1 });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Dashboard.
 *
 * @param distributor_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-08-28
 */
exports.getDistributorTotalOrders = async (request, response) => {
    try {
        let { distributor_id } = request.body;
        let today = moment().utcOffset("+05:30").format('YYYY-MM-DD');

        let startDate = `${today}T00:00:00.000Z`;
        let endDate = `${today}T23:59:59.000Z`;

        let monthStartDate = moment().utcOffset("+05:30").format("YYYY-MM-01");
        let monthEndDate = moment().utcOffset("+05:30").format("YYYY-MM-DD");

        // Get Total Orders
        let totalOrders = await Order.find({ distributor_id: distributor_id }).count();

        // Get today's total orders
        let totalOrdersOfToday = await Order.find({
            distributor_id: distributor_id,
            order_datetime: {
                $gte: startDate,
                $lt: endDate
            }
        }).count();

        // Get today's total pending orders
        let totalPendingOrdersOfToday = await Order.find({
            distributor_id: distributor_id,
            order_status: "PENDING",
            order_datetime: {
                $gte: startDate,
                $lt: endDate
            }
        }).count();

        // Get today's total Accepted orders
        let totalAcceptedOrdersOfToday = await Order.find({
            distributor_id: distributor_id,
            order_status: "ACCEPTED",
            order_datetime: {
                $gte: startDate,
                $lt: endDate
            }
        }).count();

        let DashboardData = { totalOrders, totalOrdersOfToday, totalPendingOrdersOfToday, totalAcceptedOrdersOfToday };

        Order.aggregate([
            {
                "$match": {
                    "$and": [
                        {
                            "order_datetime": {
                                $gte: new Date(monthStartDate + 'T00:00:00.000Z'),
                                $lte: new Date(monthEndDate + 'T23:59:59.000Z'),
                            }
                        },
                        { "distributor_id": mongoose.Types.ObjectId(distributor_id) }
                    ]
                }
            },
            {
                "$group": {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order_datetime" } }, count: { $sum: 1 }
                }
            },
            { "$sort": { _id: -1 } }
        ]).then(async function (data) {
            let ChartData = [];

            if (data && data.length > 0) {
                monthStartDate = new Date(monthStartDate);
                monthEndDate = new Date(monthEndDate);

                let range = await getDates(new Date(monthStartDate), new Date(monthEndDate));

                range.forEach(element => {
                    let date = moment(element).format('YYYY-MM-DD');
                    let findData = data.find(relement => relement._id == date);

                    let obj = {
                        date: date,
                        count: 0
                    }

                    if (findData) {
                        obj.count = findData.count;
                    }

                    ChartData.push(obj);
                });
            }

            return response.send({ status: true, message: 'Distributor found.', ChartData, DashboardData });
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Brand Dashboard.
 *
 * @param brand_user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-10-08
 */
exports.getBrandOrderReports = async (request, response) => {
    try {
        let { brand_user_id } = request.body;
        let today = moment().utcOffset("+05:30").format('YYYY-MM-DD');

        let startDate = `${today}T00:00:00.000Z`;
        let endDate = `${today}T23:59:59.000Z`;

        User.find({ brand_user_id: brand_user_id }, { _id: 1 }, async function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Distributor has not been found.",
                })
            } else {
                if (data && data.length > 0) {
                    let results = {};

                    let distributors = data.map(user => user._id);

                    // Get Total Orders
                    let totalOrders = await Order.find({
                        distributor_id: distributors
                    }).count();
                    results.total_orders = totalOrders;

                    // Get Total Pending Orders
                    let totalPendingOrders = await Order.find({
                        distributor_id: distributors,
                        order_status: "PENDING",
                    }).count();
                    results.total_pending_orders = totalPendingOrders;

                    // Get Total Accepted Orders
                    let totalAcceptedOrders = await Order.find({
                        distributor_id: distributors,
                        order_status: "ACCEPTED",
                    }).count();
                    results.total_accepted_orders = totalAcceptedOrders;

                    // Get Total Delivered Orders
                    let totalDeliveredOrders = await Order.find({
                        distributor_id: distributors,
                        order_status: "DELIVERED",
                    }).count();
                    results.total_delivered_orders = totalDeliveredOrders;

                    // Get Total Canceled Orders
                    let totalRejectedOrders = await Order.find({
                        distributor_id: distributors,
                        order_status: "REJECTED_BY",
                    }).count();
                    results.total_rejected_orders = totalRejectedOrders;

                    // Get today's total orders
                    let totalOrdersOfToday = await Order.find({
                        distributor_id: distributors,
                        order_datetime: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    }).count();
                    results.todays_orders = totalOrdersOfToday;

                    // Get today's total pending orders
                    let totalPendingOrdersOfToday = await Order.find({
                        distributor_id: distributors,
                        order_status: "PENDING",
                        order_datetime: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    }).count();
                    results.todays_pending_orders = totalPendingOrdersOfToday;

                    // Get today's total Delivered orders
                    let totalDeliveredOrdersOfToday = await Order.find({
                        distributor_id: distributors,
                        order_status: "DELIVERED",
                        order_datetime: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    }).count();
                    results.todays_delivered_orders = totalDeliveredOrdersOfToday;

                    return response.send({ status: true, message: 'Brand Dashboard Report', results });
                } else {
                    return response.send({ status: false, message: 'User has not been found.' });
                }
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

function getDates(startDate, endDate) {
    const dates = []
    let currentDate = startDate;

    const addDays = function (days) {
        const date = new Date(this.valueOf())
        date.setDate(date.getDate() + days)
        return date
    }
    while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = addDays.call(currentDate, 1)
    }

    return dates;
}

/**
 * Send Delivery OTP
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-02
 */
module.exports.sendDeliveryConfirmationOTP = async (request, response) => {
    try {
        let { order_id } = request.body;

        let order = await Order.findOne({ _id: order_id, order_status: "ACCEPTED" });

        if (!order) {
            return response.send({ status: false, message: "Order has not been found." });
        }

        let order_details = JSON.parse(order.order_details);
        let user_name = order_details.shipping_address.first_name + ' ' + order_details.shipping_address.last_name;
        let phone = order_details.shipping_address.phone;
        phone = phone.replace(" ", "");

        let otp = await CommonHelper.randomNumberGenerator();

        // Send OTP
        CommonHelper.sendAcceptOrderOTP(user_name, phone, otp).then(data => {
            if (data) {
                Order.updateOne({ _id: order_id }, { order_otp: otp }, function (err, data) {
                    return response.send({
                        status: true,
                        message: "OTP has been sent to customer successfully."
                    })
                });
            } else {
                return response.send({ status: false, message: 'OTP failed to send on customer phone number. Please try again.' });
            }
        }).catch(err => {
            return response.send({ status: false, message: 'OTP failed to send on customer phone number. Please try again.' });
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Verify Delivery OTP
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-02
 */
module.exports.verifyDeliveryOTP = async (request, response) => {
    try {
        let { order_id, order_otp } = request.body;

        let order = await Order.findOne({ _id: order_id, order_status: "ACCEPTED" });

        if (!order) {
            return response.send({ status: false, message: "Order has not been found." });
        }

        if (order.order_otp != order_otp) {
            return response.send({ status: false, message: "Please enter valid OTP code." });
        }

        let order_no = order.order_no;
        let order_tag = "Order Delivered By Distributor";

        Order.updateOne({ _id: order_id }, { order_otp: null, order_status: "DELIVERED" }, async function (error, result) {
            if (error) {
                return response.send({ status: false, message: 'Something went wrong with update status.' });
            } else {
                let distributor_id = order.distributor_id;

                // Find distributor & Calculate commision
                let distributor = await User.findOne({ _id: distributor_id });

                let amount = parseFloat(order.amount);

                let distributor_commision = (distributor.distributor_commision) ? parseFloat(distributor.distributor_commision) : 0;
                let commision_amount = amount * (distributor_commision / 100);

                let transactionObj = {
                    order_id: order._id,
                    distributor_id,
                    amount: commision_amount,
                    type: "Credited" // Type: Credited,Debited
                };

                const transaction = new Transaction(transactionObj);
                await transaction.save();

                // Update status and fullfillment details
                await exports.updateShopifyOrderStatus(order_no, order_tag);

                // Update COD order status
                await exports.checkCODTransactionOfOrder(order_no);

                return response.send({
                    status: true,
                    message: "Order has been delivered successfully."
                });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Verify Delivery OTP
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-02
 */
module.exports.verifyDeliveryBySignature = async (request, response, next) => {
    try {
        // Upload file
        const form = formidable.IncomingForm();

        form.parse(request, async (err, fields, files) => {
            if (err) {
                return response.send({ status: false, message: 'Something went wrong with update status.', error: err });
            } else {
                let order_id = fields.order_id;

                if (!order_id) {
                    return response.send({ status: false, message: "Order id is required." });
                }

                // Check order
                let order = await Order.findOne({ _id: order_id, order_status: "ACCEPTED" });
                if (!order) {
                    return response.send({ status: false, message: "Order has not been found." });
                }

                let fileName = files.signature.name;
                let oldPath = files.signature.path;
                let newPath = path.join(__dirname, '../../', 'uploads') + '/' + fileName;
                let rawData = fs.readFileSync(oldPath);

                fs.writeFile(newPath, rawData, async function (err) {
                    if (err) {
                        return response.send({ status: false, message: 'Something went wrong with update status.', error: err });
                    } else {
                        await fs.unlinkSync(oldPath);

                        Order.updateOne({ _id: order_id }, { customer_signature_attachment: fileName, order_status: "DELIVERED" }, async function (error, result) {
                            if (error) {
                                return response.send({ status: false, message: 'Something went wrong with update status.' });
                            } else {
                                let distributor_id = order.distributor_id;

                                // Find distributor & Calculate commision
                                let distributor = await User.findOne({ _id: distributor_id });

                                let amount = parseFloat(order.amount);

                                let distributor_commision = (distributor.distributor_commision) ? parseFloat(distributor.distributor_commision) : 0;
                                let commision_amount = amount * (distributor_commision / 100);

                                let transactionObj = {
                                    order_id: order._id,
                                    distributor_id,
                                    amount: commision_amount,
                                    type: "Credited" // Type: Credited,Debited
                                };

                                const transaction = new Transaction(transactionObj);
                                await transaction.save();

                                // Update status and fullfillment details
                                let order_no = order.order_no;
                                let order_tag = "Order Delivered By Distributor";
                                await exports.updateShopifyOrderStatus(order_no, order_tag);

                                // Update COD order status
                                await exports.checkCODTransactionOfOrder(order_no);

                                return response.send({
                                    status: true,
                                    message: "Order has been delivered successfully."
                                });
                            }
                        });
                    }
                })
            }
        })
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong.", error });
    }
};

/**
 * Send Delivery OTP
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-02
 */
module.exports.rejectUnApprovedOrders = async () => {
    try {
        console.log("✓ CRON Started");
        let now = moment().utcOffset("+05:30");
        let currentDate = moment().utcOffset("+05:30").format('YYYY-MM-DD');

        let orders = await Order.find({ order_status: "PENDING" });

        asyncL.each(orders, async (order, callback) => {
            let orderDate = moment(order.order_datetime).utcOffset("+05:30").format("YYYY-MM-DD");

            if (orderDate == currentDate) {
                let end = moment(order.order_datetime).utcOffset("+05:30");
                let dif = moment.duration(now.diff(end));
                let minutes = (dif.hours() * 60) + dif.minutes();

                if (minutes > 60) {
                    await Order.updateOne({ _id: order._id }, { order_status: "NOT_ACCEPTED_BY" });
                }
                callback();
            } else if (orderDate < currentDate) {
                await Order.updateOne({ _id: order._id }, { order_status: "NOT_ACCEPTED_BY" });
                callback();
            }
        }, async (err) => {
            console.log("✘ CRON Ended");
        });
    } catch (error) {
        console.log(error);
    }
};

/**
 * Update Order's Schedule and Address Details
 *
 * @param order_id, order_status, expected_delivery_time, address_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-02
 */
module.exports.updateOrderScheduleByDistributor = async (request, response) => {
    try {
        let { order_id, order_status, expected_delivery_time, address_details } = request.body;
        expected_delivery_time = moment(expected_delivery_time).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss');
        address_details = JSON.stringify(address_details);

        let order = await Order.findOne({ _id: order_id, order_status: "ACCEPTED" });

        if (!order) {
            return response.send({ status: false, message: "Order has not been found." });
        }

        Order.updateOne({ _id: order_id }, { order_status, expected_delivery_time, address_details }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong with schedule order.",
                    error: err
                })
            } else {
                return response.send({
                    status: true,
                    message: "Order has been scheduled successfully."
                })
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong with schedule order.",
            error: err
        })
    }
};

/**
 * Update Order's Status
 *
 * @param order_id, 
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-29
 */
module.exports.updateShopifyOrderStatus = async (order_id, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get order details by id
            getOrderById(order_id).then(async (orderResult) => {
                if (orderResult.response && orderResult.response.data && orderResult.response.data.errors) {
                    resolve({
                        status: false,
                        message: orderResult.response.data.errors,
                    });
                } else {
                    let orderInfo = orderResult.order;
                    let line_items = orderInfo.line_items;
                    let order_tags = orderInfo.tags;

                    // Update status
                    // Check if status already exists in tags
                    let orderStatusArr = order_tags.split(',');

                    if (orderStatusArr.includes(status) == false) {
                        let tags = order_tags;

                        if (order_tags) {
                            tags = tags + `, ${status}`;
                        } else {
                            tags = status;
                        }

                        let requestObject = {
                            "order": {
                                "id": 53715763354,
                                "tags": tags,
                            }
                        };

                        updateShopifyOrderTags(order_id, requestObject).then(resStatus => {
                            // Update fullfillment status
                            line_items = line_items.map(data => {
                                let element = {
                                    id: data.id
                                };
                                return element;
                            });

                            let requestObject = {
                                "fulfillment": {
                                    "location_id": 53715763354,
                                    "tracking_number": null,

                                    // this you will get from order details
                                    "line_items": line_items
                                }
                            };

                            // Get order fullfillment details
                            getFullfillmentOrderById(order_id, requestObject).then(async (orderFullfillment) => {
                                if (orderFullfillment.response && orderFullfillment.response.data && orderFullfillment.response.data.errors) {
                                    resolve({
                                        status: false,
                                        message: orderFullfillment.response.data.errors,
                                    });
                                } else {
                                    if (orderFullfillment.fulfillment) {
                                        let fullfillment_id = orderFullfillment.fulfillment.id;

                                        // Update delivered status
                                        updateOrderDeliverStatus(order_id, fullfillment_id).then(async (statusReponse) => {
                                            resolve({
                                                status: false,
                                                message: "Fullfillment details has not been found."
                                            });
                                        });
                                    } else {
                                        resolve({
                                            status: false,
                                            message: "Fullfillment details has not been found."
                                        });
                                    }
                                }
                            });
                        });
                    }
                }
            });
        } catch (error) {
            resolve({
                status: false,
                message: "Something went wrong with schedule order."
            });
        }
    });
}

/**
 * Update COD order transaction details
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-30
 */
module.exports.checkCODTransactionOfOrder = async (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            getOrderById(order_id).then((orderResult) => {
                if (orderResult && orderResult.order) {
                    let orderInfo = orderResult.order;
                    let order_tags = orderInfo.tags;

                    if (order_tags.includes("✅ Confirmed-CODfirm")) {
                        getOrderTransactionById(order_id).then((transaction) => {
                            if (transaction.transactions && transaction.transactions.length > 0) {
                                let transactionDetails = transaction.transactions[0];

                                let id = transactionDetails.id;
                                let amount = transactionDetails.amount;

                                let requestObj = {
                                    "transaction": {
                                        "currency": "INR",
                                        "amount": amount,
                                        "kind": "sale",
                                        "source": "external",
                                        "parent_id": id
                                    }
                                }

                                checkOrderCODStatus(order_id, requestObj).then(result => {
                                    resolve({
                                        status: true,
                                        message: "Success",
                                        transaction: result
                                    });
                                });
                            } else {
                                resolve({
                                    status: false,
                                    message: "failed"
                                });
                            }
                        });
                    } else {
                        resolve({
                            status: false,
                            message: "failed"
                        });
                    }
                } else {
                    resolve({
                        status: false,
                        message: "failed"
                    });
                }
            });
        } catch (error) {
            resolve({
                status: false,
                message: "failed"
            });
        }
    });
};

/**
 * Update order tags
 *
 * @param order_id, 
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-09-29
 */
module.exports.updateOrderTags = async (order_id, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order_statuses = ["Accepted By Distributor", "Cancelled By Distributor", "Order Delivered By Distributor", "RTO, RTO by Distributor"];

            if (order_statuses.includes(status) == false) {
                resolve({
                    status: false,
                    message: "Order status has not been matched. Please eneter correct status."
                });
            }

            // Get order details by id
            getOrderById(order_id).then(async (orderResult) => {
                if (orderResult.response && orderResult.response.data && orderResult.response.data.errors) {
                    resolve({
                        status: false,
                        message: orderResult.response.data.errors,
                    });
                } else {
                    let orderInfo = orderResult.order;
                    let order_tags = orderInfo.tags;

                    // Check if status already exists in tags
                    let orderStatusArr = order_tags.split(',');

                    if (orderStatusArr.includes(status) == false) {
                        let tags = order_tags;

                        if (order_tags) {
                            tags = tags + `, ${status}`;
                        } else {
                            tags = status;
                        }

                        let requestObject = {
                            "order": {
                                "id": 53715763354,
                                "tags": tags,
                            }
                        };

                        updateShopifyOrderTags(order_id, requestObject).then(resStatus => {
                            resolve({
                                status: true,
                                message: "Status has been updated successfully.",
                            });
                        });
                    } else {
                        resolve({
                            status: false,
                            message: "Order status is already updated."
                        });
                    }
                }
            });
        } catch (error) {
            resolve({
                status: false,
                message: "Something went wrong with schedule order.",
            });
        }
    });
}

/**
 * Cancelled Order
 *
 * @param order_id, 
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-10-29
 */
module.exports.cancelOrder = async (request, response) => {
    try {
        let orderInfo = request.body;
        console.log("BODY:::::::::", orderInfo);

        let order_no = orderInfo.id;

        Order.updateOne({ order_no: order_no }, { order_status: "CANCELLED" }, async function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong. Order status has not been updated."
                })
            } else {
                return response.send({ status: true, message: "Order has been cancelled successfully." });
            }
        });

        return response.send({
            status: true,
            message: "Order has been canceled successfully",
        })
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong with schedule order.",
            error: err
        })
    }
}
