const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const moment = require('moment');

/**
 * Register new user
 *
 * @param first_name, last_name, email, phone
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.signUp = async function (request, response) {
    // Create a new user
    try {
        const user = new User(request.body)
        await user.save()
        var token = await user.generateAuthToken();
        return response.send({ status: true, message: "User has been registered successfully." })
    } catch (err) {
        return response.send({
            status: false,
            message: (err.name === 'MongoError' && err.code === 11000) ? 'Email is already exists in our records!' : "Something went wrong"
        });
    }
};

/**
 * User authentication
 *
 * @param email, password
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.signIn = async function (request, response) {
    //Login a registered user
    try {
        const { email, password } = request.body

        // Search for a user by email and password.
        const user = await User.findOne({ email })
        if (!user) {
            return response.send({ status: false, message: 'Email has not been match with our records.' });
        }

        //Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return response.send({ status: false, message: 'Password has not been match with our records.' });
        }

        //Generate and update JWT token to user account
        const token = await user.generateAuthToken();

        return response.send({
            status: true,
            data: { user, token }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Send OTP to Phone
 *
 * @param phone
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.sendOTP = async function (request, response) {
    try {
        const { phone } = request.body;

        // Search for a user by phone.
        const user = await User.findOne({ phone });

        if (!user) {
            return response.send({ status: false, message: 'Phone number has not been match with our records.' });
        } else {
            var otp = Math.floor(100000 + Math.random() * 900000);
            var currentTime = new Date().getTime();

            await User.updateOne({ _id: user._id }, { otp: otp, otpSentAt: currentTime }, function (error, result) {
                if (error) {
                    console.log(error);
                    return response.send({ status: false, message: 'OTP failed to send on your phone number. Please try again.' });
                } else {
                    return response.send({ status: true, message: 'OTP has been sent on your phone number.', otp: otp });
                }
            });
        }
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

/**
 * verify OTP
 *
 * @param phone, otp
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.verifyOTP = async function (request, response) {
    try {
        const { phone, otp } = request.body

        // Search for a user by phone.
        const userPhoneVerification = await User.findOne({ phone });
        if (!userPhoneVerification) {
            return response.send({ status: false, message: 'Phone has not been match with our records.' });
        }

        // Search for a user by phone and OTP.
        const user = await User.findOne({ phone, otp });
        if (!user) {
            return response.send({ status: false, message: 'The OTP you enetered is invalid. Please enter correct OTP.' });
        }

        //Generate and update JWT token to user account
        const token = await user.generateAuthToken();

        return response.send({
            status: true,
            data: { user, token }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};