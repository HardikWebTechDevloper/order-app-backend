const mongoose = require('mongoose');
const axios = require('axios');

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

// Use below syntax for call OTP function
// commonHelper.sendAcceptOrderOTP("Hardik Gadhiya", phone, otp).then(data => console.log(data))