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

module.exports.sendLoginOTP = (phone, otp) => {
    try {
        // Make a request for a user with a given ID
        axios.get('http://ui.netsms.co.in/API/SendSMS.aspx', {
            params: {
                APIkey: "yoF0y7c3GGrW2yy0quGQ3eyL7H",
                SenderID: "MYFTNS",
                SMSType: 2,
                Mobile: phone,
                MsgText: `Your OTP for login MyFitness Delivery Partner App is ${otp}.`,
                TemplateID: 1207162798669997773,
                EntityID: 1701159055612047808
            }
        }).then(function (response) {
            // handle success
            console.log("response", response);
            return true;
        }).catch(function (error) {
            // handle error
            console.log("error",error);
            return false;
        });
    } catch (e) {
        console.log("error",error);
        return false;
    }
}