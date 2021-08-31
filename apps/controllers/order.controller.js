const moment = require('moment');
const mongoose = require('mongoose');
const MomentRange = require('moment-range');
const momentR = MomentRange.extendMoment(moment);

const Order = require('../models/orders.model');
const User = require('../models/user.model');
const Role = require('../models/roles.model');
const Transaction = require('../models/transactions.model');
const DistributorPincode = require('../models/distributor_pincodes.model');

/**
 * create new order
 *
 * @param amount, pincode, order_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-26
 */
exports.placeOrder = async function (request, response) {
    try {
        var { amount, pincode, order_details } = request.body;
        order_details = JSON.stringify(order_details);

        // Find distributor using pincode
        let distributor = await DistributorPincode.findOne({ pin_code: pincode });

        if (!distributor) {
            return response.send({
                status: false,
                message: "Distributor not found."
            })
        }

        let distributor_id = distributor.distributor_id;

        let createOrderObj = {
            amount,
            pincode,
            order_details,
            distributor_id
        };

        const order = new Order(createOrderObj)
        await order.save();

        if (order) {
            return response.send({
                status: true,
                message: "Order has been created successfully."
            });
            // // Calculate distributor commision
            // let distributor_commision = (distributor.distributor_commision) ? parseFloat(distributor.distributor_commision) : 0;
            // amount = parseFloat(amount);
            // let commision_amount = amount * (distributor_commision / 100);

            // let transactionObj = {
            //     order_id: order._id,
            //     distributor_id,
            //     amount: commision_amount,
            //     type: "Credited" // Type: Credited,Debited
            // };

            // const transaction = new Transaction(transactionObj);
            // await transaction.save();

            // if (transaction) {
            //     return response.send({
            //         status: true,
            //         message: "Order has been created successfully."
            //     });
            // } else {
            //     return response.send({
            //         status: false,
            //         message: "Something went wrong. Transaction has not been created."
            //     });
            // }
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Order has not been created."
            });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong.", error })
    }
};

/**
 * Get orders.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-28
 */
exports.getOrders = async function (request, response) {
    try {
        let { distributor_id, order_status } = request.body;
        let whereClause = { distributor_id };

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
exports.updateOrderStatus = async function (request, response) {
    try {
        let { order_id, order_status, deliver_by } = request.body;
        let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

        let updateObj = {
            order_status: order_status,
            status_updated_at: currentDateTime
        };

        if (order_status === 'ACCEPTED') {
            updateObj.deliver_by = deliver_by;
        }

        Order.updateOne({ _id: order_id }, updateObj, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong. Order status has not been updated."
                })
            } else {
                let actionName = order_status.toLowerCase();

                return response.send({
                    status: true,
                    message: "Order has been " + actionName + " successfully."
                })
            }
        });
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
exports.getDistributorTransactions = async function (request, response) {
    try {
        let { distributor_id } = request.body;

        Transaction.find({ distributor_id: distributor_id }, function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Transaction not found.",
                })
            } else {
                return response.send({
                    status: true,
                    message: "Transaction found.",
                    data: data
                })
            }
        });
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
exports.getBrandOrders = async function (request, response) {
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
                        return response.send({
                            status: true,
                            message: "Orders found.",
                            data: orders
                        })
                    }
                });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

/**
 * Dashboard.
 *
 * @param order_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-08-28
 */
exports.getBrandTotalOrders = async function (request, response) {
    try {
        let { brand_user_id } = request.body;
        let today = moment().format('YYYY-MM-DD');

        let startDate = `${today}T00:00:00.000Z`;
        let endDate = `${today}T23:59:59.000Z`;

        let monthStartDate = moment().subtract(1, 'month').format("YYYY-MM-DDT00:00:00.000Z");
        let monthEndDate = moment().format("YYYY-MM-DDT23:59:59.000Z");

        User.find({ brand_user_id: brand_user_id }, { _id: 1 }, async function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Distributor has not been found.",
                })
            } else {
                // Get all distributors
                let distributors = data.map(user => user._id);

                // Get Total Orders
                let totalOrders = await Order.find({ distributor_id: distributors }).count();

                // Get today's total orders
                let totalOrdersOfToday = await Order.find({
                    distributor_id: distributors,
                    order_datetime: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }).count();

                // Get today's total pending orders
                let totalPendingOrdersOfToday = await Order.find({
                    distributor_id: distributors,
                    order_status: "PENDING",
                    order_datetime: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }).count();

                // Get today's total Accepted orders
                let totalAcceptedOrdersOfToday = await Order.find({
                    distributor_id: distributors,
                    order_status: "ACCEPTED",
                    order_datetime: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }).count();

                let DashboardData = { totalOrders, totalOrdersOfToday, totalPendingOrdersOfToday, totalAcceptedOrdersOfToday };

                Order.aggregate([
                    {
                        $match: { // filter to limit to whatever is of importance
                            // "distributor_id": distributors,
                            "order_datetime": {
                                $gte: new Date(monthStartDate),
                                $lte: new Date(monthEndDate),
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$order_datetime" } }, count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }
                ]).then(function (data) {
                    if (data && data.length > 0) {
                        const range = momentR.range(moment(monthStartDate), moment(monthEndDate));
                        // console.log(Array.from(range.by('day')))
                    }
                    return response.send({ status: true, message: 'Distributor found.', data: data, DashboardData });
                });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong." });
    }
};

