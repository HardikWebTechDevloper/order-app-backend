const mongoose = require('mongoose');
const axios = require('axios');

//Setup enviroment file
require('dotenv').config();

/**
 * This function create dynamic schema in mongo
 *
 * @param modelName, model
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-20
 */
module.exports.createNewModel = (modelName, model) => {
    const Schema = mongoose.Schema;

    if (mongoose.models && mongoose.models[modelName] == undefined) {
        // while req.body.model contains your model definition
        mongoose.model(modelName, new Schema(model));
    }

    return true;
}

/** 
 * Random string generator
 **/
module.exports.stringGenerator = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/** 
 * Random number generator
 **/
module.exports.randomNumberGenerator = (length) => {
    return Math.floor(100000 + Math.random() * 900000);
}

/** 
 * Send OTP for login and authentication
 **/
module.exports.sendLoginOTP = (phone, otp) => {
    let url = `https://ui.netsms.co.in/API/SendSMS.aspx?APIkey=yoF0y7c3GGrW2yy0quGQ3eyL7H&SenderID=MYFTNS&SMSType=2&Mobile=${phone}&MsgText=Your%20OTP%20for%20login%20MyFitness%20Delivery%20Partner%20App%20is%20${otp}.&EntityID=1701159055612047808&TemplateID=1207162798669997773`;

    // Make a request for a user with a given ID
    const promise = axios.get(url);
    const dataPromise = promise.then((response) => response.data);

    return dataPromise;
}

/** 
 * Send OTP for login and authentication
 **/
module.exports.sendAcceptOrderOTP = (user_name, phone, otp) => {
    let url = `https://ui.netsms.co.in/API/SendSMS.aspx?APIkey=yoF0y7c3GGrW2yy0quGQ3eyL7H&SenderID=MYFTNS&SMSType=2&Mobile=${phone}&MsgText=Hello%20${user_name},%20Your%20OTP%20${otp}%20for%20accepting%20delivery%20of%20your%20MYFITNESS%20order.&EntityID=1701159055612047808&TemplateID=1207162798706655909`;

    // Make a request for a user with a given ID
    const promise = axios.get(url);
    const dataPromise = promise.then((response) => response.data);

    return dataPromise;
}

/** 
 * Verfiy Delivery Partner
 **/
module.exports.verfiyDeliveryPartner = (hostName, clientId, clientPassword) => {
    try {
        // Make a request for a user with a given ID
        const promise = axios({
            url: hostName + '/api/v1/token',
            method: 'GET',

            // `headers` are custom headers to be sent
            headers: {
                'client-id': clientId,
                'client-secret': clientPassword,
                'Content-Type': 'application/json',
                'Accept-Language': 'en_US'
            },
        });
        const dataPromise = promise.then((response) => response.data).catch((error) => error);

        return dataPromise;
    } catch (error) {
        return null;
    }
}

/** 
 * Create Deivery Order in DUNZO
 **/
module.exports.createOrderDeliveryInDunzo = (clientId, hostName, token, locationObj) => {
    try {
        // Make a request for a user with a given ID
        const promise = axios({
            method: 'POST',
            url: hostName + '/api/v2/tasks',

            // `headers` are custom headers to be sent
            headers: {
                'client-id': clientId,
                'Authorization': token,
                'Content-Type': 'application/json',
                'Accept-Language': 'en_US'
            },

            // `Data`
            data: locationObj
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return null;
    }
}

/** 
 * Get Order By Id 
 **/
module.exports.getOrderById = (order_id) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}.json`

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'GET',
            url: url
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}

/** 
 * Get Order By Id 
 **/
module.exports.updateShopifyOrderTags = (order_id, request) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}.json`

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'PUT',
            url: url,
            data: request
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}

/** 
 * Get Fullfillment Order By Id 
 **/
module.exports.getFullfillmentOrderById = (order_id, request) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}/fulfillments.json`

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'POST',
            url: url,
            // `Data`
            data: request
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}

/** 
 * Update Delivered Status
 **/
module.exports.updateOrderDeliverStatus = (order_id, fullfillment_id) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}/fulfillments/${fullfillment_id}/events.json`;

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'POST',
            url: url,
            // `Data`
            data: {
                "event": {
                    "status": "delivered"
                }
            }
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}

/** 
 * Get transaction for COD order.
 **/
module.exports.getOrderTransactionById = (order_id) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}/transactions.json`;

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'GET',
            url: url
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}

/** 
 * Update COD order transaction
 **/
module.exports.checkOrderCODStatus = (order_id, requestObj) => {
    try {
        let url = `https://ff7e98c56279a0a52ce6c7a55be542f3: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@myfitness-official-store.myshopify.com/admin/api/2021-07/orders/${order_id}/transactions.json`;

        // Make a request for a user with a given ID
        const promise = axios({
            method: 'POST',
            url: url,
            // `Data`
            data: requestObj
        });

        const dataPromise = promise.then((response) => response.data).catch((error) => error);
        return dataPromise;
    } catch (error) {
        return error;
    }
}
