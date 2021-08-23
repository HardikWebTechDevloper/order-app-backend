const Order = require('../models/orders.model');
const User = require('../models/user.model');
const Role = require('../models/roles.model');
const Transaction = require('../models/transactions.model');

const moment = require('moment');

/**
 * create new order
 *
 * @param amount, deliver_by, pincode, order_details
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2021-07-26
 */
exports.placeOrder = async function (request, response) {
    try {
        var { amount, deliver_by, pincode, order_details } = request.body;

        // Find Role
        let role = await Role.findOne({ role_name: "Distributor" });
        if (!role) {
            return response.send({
                status: false,
                message: "Role details not exixts."
            })
        }

        let role_id = role._id;

        // Find distributor using pincode
        let distributor = await User.findOne({ role_id: role_id, pin_code: pincode });

        if (!distributor) {
            return response.send({
                status: false,
                message: "Distributor not found."
            })
        }

        let distributor_id = distributor._id;
        let distributor_commision = (distributor.distributor_commision) ? parseFloat(distributor.distributor_commision) : 0;

        let createOrderObj = {
            amount,
            deliver_by,
            pincode,
            order_details,
            distributor_id
        };

        const order = new Order(createOrderObj)
        await order.save();

        if (order) {
            // Calculate distributor commision
            amount = parseFloat(amount);
            let commision_amount = amount * (distributor_commision / 100);

            let transactionObj = {
                order_id: order._id,
                distributor_id,
                amount: commision_amount,
                type: "Credited" // Type: Credited,Debited
            };

            const transaction = new Transaction(transactionObj);
            await transaction.save();

            if (transaction) {
                return response.send({
                    status: true,
                    message: "Order has been created successfully."
                });
            } else {
                return response.send({
                    status: false,
                    message: "Something went wrong. Transaction has not been created."
                });
            }
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
        return response.send({ status: false, message: error })
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
        return response.send({ status: false, message: error })
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
        return response.send({ status: false, message: error })
    }
};