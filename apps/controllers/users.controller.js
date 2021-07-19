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
        return response.send({ status: false, message: "Something went wrong" })
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
        return response.send({ status: false, message: "Something went wrong" })
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
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Create Distributor
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.createDistributor = async function (request, response) {
    try {
        const { phone, email } = request.body;
        let body = request.body;

        // Search for a user by phone.
        const userPhoneExists = await User.findOne({ phone });
        if (userPhoneExists) {
            return response.send({ status: false, message: 'Phone number is already exists in our records.' });
        }

        // Search for a user by email.
        const userEmailExists = await User.findOne({ email });
        if (userEmailExists) {
            return response.send({ status: false, message: 'Email is already exists in our records.' });
        }

        body.status = true;
        body.isDeleted = false;

        const user = new User(request.body)
        await user.save();

        if (user && user.id) {
            return response.send({ status: true, message: 'Distributor has been created successfully.', data: user });
        } else {
            return response.send({ status: false, message: 'Something went wrong with distributor creation.' });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Update Distributor
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.updateDistributor = async function (request, response) {
    try {
        const { user_id } = request.body;
        const body = request.body;

        delete body.user_id;

        User.updateOne({ _id: user_id }, body, function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'Distributor has not been updated.' });
            } else {
                return response.send({ status: true, message: 'Distributor has been updated successfully.' });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Find all users or by role id wise
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.getUsers = async function (request, response) {
    try {
        const { role_id } = request.body;

        let whereClause = {
            status: true
        };

        if (role_id && role_id != '') {
            whereClause.role_id = role_id;
        }

        User.find(whereClause, function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'Something went wrong' });
            } else {
                return response.send({ status: true, message: 'User found.', data: data });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};


/**
 * Create staff
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.createStaff = async function (request, response) {
    try {
        const { phone, email } = request.body;
        let body = request.body;

        // Search for a user by phone.
        const userPhoneExists = await User.findOne({ phone });
        if (userPhoneExists) {
            return response.send({ status: false, message: 'Phone number is already exists in our records.' });
        }

        // Search for a user by email.
        const userEmailExists = await User.findOne({ email });
        if (userEmailExists) {
            return response.send({ status: false, message: 'Email is already exists in our records.' });
        }

        body.status = true;
        body.isDeleted = false;

        const user = new User(request.body)
        await user.save();

        if (user && user.id) {
            return response.send({ status: true, message: 'Staff member has been added successfully.', data: user });
        } else {
            return response.send({ status: false, message: 'Something went wrong with staff member creation.' });
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Update Staff
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.updateStaff = async function (request, response) {
    try {
        const { user_id } = request.body;
        const body = request.body;

        delete body.user_id;

        User.updateOne({ _id: user_id }, body, function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'Distributor has not been updated.' });
            } else {
                return response.send({ status: true, message: 'Distributor has been updated successfully.' });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Delete User
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.deleteUser = async function (request, response) {
    try {
        const { user_id } = request.body;

        User.updateOne({ _id: user_id }, { isDeleted: true }, function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'User has not been delete.' });
            } else {
                return response.send({ status: true, message: 'User has been deleted successfully.' });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};