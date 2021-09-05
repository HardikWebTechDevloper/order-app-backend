const mongoose = require('mongoose');
const moment = require('moment');
const { extendMoment } = require('moment-range');

const CommonHelper = require('../helpers/common.helper');
const Order = require('../models/orders.model');
const User = require('../models/user.model');
const Role = require('../models/roles.model');
const Transaction = require('../models/transactions.model');
const DistributorPincode = require('../models/distributor_pincodes.model');

const momentR = extendMoment(moment);

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
        let { order_id, order_status, deliver_by, staff_user_id } = request.body;
        let currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

        let updateObj = {
            order_status: order_status,
            status_updated_at: currentDateTime
        };

        if (order_status === 'ACCEPTED') {
            if (!staff_user_id) {
                return response.send({
                    status: false,
                    message: "Staff user id is required"
                })
            }

            if (!deliver_by) {
                return response.send({
                    status: false,
                    message: "Deliver by is required"
                })
            }

            updateObj.deliver_by = deliver_by;
            updateObj.staff_id = staff_user_id;
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
        let { distributor_id, brand_user_id } = request.body;

        if (distributor_id) {
            Transaction.find({ distributor_id: distributor_id }, function (err, raws) {
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
                        distributor_id: distributors
                    };

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

        let monthStartDate = moment().subtract(30, 'days').format("YYYY-MM-DD");
        let monthEndDate = moment().format("YYYY-MM-DD");

        User.find({ brand_user_id: brand_user_id }, { _id: 1 }, async function (err, data) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Distributor has not been found.",
                })
            } else {
                // Get all distributors
                let distributors = data.map(user => mongoose.Types.ObjectId(user._id));

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
                        "$match": {
                            "$and": [
                                {
                                    "order_datetime": {
                                        $gte: new Date(monthStartDate + 'T00:00:00.000Z'),
                                        $lte: new Date(monthEndDate + 'T23:59:59.000Z'),
                                    }
                                },
                                { "distributor_id": { "$in": distributors } }
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

    return dates
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
        let user_name = order_details.Name;
        let phone = (order_details.Phone) ? order_details.Phone : '9624684020';

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
        console.log(error)
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

                return response.send({
                    status: true,
                    message: "Order has been delivered successfully."
                });
            }
        });
    } catch (error) {
        console.log(error)
        return response.send({ status: false, message: "Something went wrong." });
    }
};

