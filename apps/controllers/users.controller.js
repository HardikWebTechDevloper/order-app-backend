const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require('moment');

const commonHelper = require('../helpers/common.helper');
const User = require('../models/user.model');
const Role = require('../models/roles.model');
const DistributorPincode = require('../models/distributor_pincodes.model');

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
        await user.generateAuthToken();
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
            var otp = await commonHelper.randomNumberGenerator();
            var currentTime = new Date().getTime();

            // Send OTP
            commonHelper.sendLoginOTP(phone, otp).then(data => {
                console.log(data)
                if (data) {
                    User.updateOne({ _id: user._id }, { otp: otp, otpSentAt: currentTime }, async function (error, result) {
                        if (error) {
                            return response.send({ status: false, message: 'Something went wrong with update otp.' });
                        } else {
                            // Get role
                            let user_role = await Role.findOne({ _id: user.role_id });

                            return response.send({ status: true, message: 'OTP has been sent on your phone number.', user_role });
                        }
                    });
                } else {
                    return response.send({ status: false, message: 'OTP failed to send on your phone number. Please try again.' });
                }
            }).catch(err => {
                console.log(err)
                return response.send({ status: false, message: 'OTP failed to send on your phone number. Please try again.' });
            });
        }
    } catch (error) {
        console.log(error)
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

        // Get role
        let user_role = await Role.findOne({ _id: user.role_id });

        //Generate and update JWT token to user account
        const token = await user.generateAuthToken();

        // Reset OTP
        await User.updateOne({ _id: user._id }, { otp: null });

        return response.send({
            status: true,
            data: { user, user_role, token }
        });
    } catch (error) {
        console.log(error)
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
        const { phone, email, covered_pincode } = request.body;
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

        delete body.covered_pincode;

        const user = new User(request.body)
        await user.save();

        if (user) {
            // Store Distributor Pincodes
            let distributorPincodes = [];
            let distributor_id = user._id;

            // Validate Unique Array
            const uniqueCoveredPincodes = covered_pincode.filter((value, index, self) => {
                return self.indexOf(value) === index
            });

            uniqueCoveredPincodes.map(data => {
                if (data && data != '') {
                    let element = {};
                    element.distributor_id = distributor_id;
                    element.pin_code = data;
                    distributorPincodes.push(element);
                }
            });

            await DistributorPincode.insertMany(distributorPincodes);

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
        const { user_id, covered_pincode } = request.body;
        const body = request.body;

        delete body.user_id;
        delete body.covered_pincode;

        User.updateOne({ _id: user_id }, body, async function (err, data) {
            if (err) {
                return response.send({ status: false, message: 'Distributor has not been updated.' });
            } else {
                //  Delete
                await DistributorPincode.remove({ distributor_id: user_id });

                // Validate Unique Array
                const uniqueCoveredPincodes = covered_pincode.filter((value, index, self) => {
                    return self.indexOf(value) === index
                });

                // Insert 
                uniqueCoveredPincodes.forEach(async (element) => {
                    let createPincode = new DistributorPincode({
                        distributor_id: user_id,
                        pin_code: element
                    });

                    await createPincode.save();
                });

                return response.send({ status: true, message: 'Distributor has been updated successfully.' });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Find all distributors
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.getDistributors = async function (request, response) {
    try {
        const { brand_user_id, start_date, end_date } = request.body;

        let datePickerFilter = {}

        if (start_date && end_date) {
            datePickerFilter = {
                "created_at": {
                    $gte: new Date(start_date + 'T00:00:00.000Z'),
                    $lte: new Date(end_date + 'T23:59:59.000Z'),
                }
            };
        }

        User.aggregate([
            {
                "$match": {
                    "$and": [
                        { "status": { "$eq": true } },
                        datePickerFilter,
                        { "brand_user_id": { "$eq": mongoose.Types.ObjectId(brand_user_id) } }
                    ]
                }
            },
            {
                "$lookup": {
                    "from": "cities",
                    "localField": "city_id",
                    "foreignField": "_id",
                    "as": "city"
                },
            },
            {
                "$project": {
                    "_id": 1,
                    "status": 1,
                    "brand_user_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "phone": 1,
                    "email": 1,
                    "role_id": 1,
                    "city_id": 1,
                    "city.city_name": 1,
                    "state_id": 1,
                    "country_id": 1,
                    "pin_code": 1,
                    "distributor_commision": 1,
                    "distributor_tax_details": 1,
                    "status": 1,
                }
            },
        ]).then(function (data) {
            return response.send({ status: true, message: 'Distributor found.', data: data });
        });
    } catch (error) {
        console.log(error)
        return response.send({ status: false, message: "Something went wrong" })
    }
};

/**
 * Find staff members
 *
 * @param User Object
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.getStaffList = async function (request, response) {
    try {
        const { distributor_id } = request.body;

        User.aggregate([
            {
                "$match": {
                    "$and": [
                        { "status": { "$eq": true } },
                        { "distributor_id": { "$eq": mongoose.Types.ObjectId(distributor_id) } }
                    ]
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "status": 1,
                    "distributor_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "phone": 1
                }
            },
        ]).then(function (data) {
            return response.send({ status: true, message: 'Staff found.', data: data });
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
        const { role_name } = request.body;

        let whereClause = {
            status: true
        };

        if (role_name && role_name != '') {
            let role = await getRoleIdByRoleName(role_name);
            whereClause.role_id = role._id;
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

// Get role_id by name
async function getRoleIdByRoleName(role_name) {
    let role = await Role.findOne({ role_name: role_name });
    return role;
}

/**
 * Get User By Id
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 */
module.exports.getUserById = async function (request, response) {
    try {
        let { user_id } = request.body;

        let user = await User.findOne({ _id: user_id });

        if (user) {
            return response.send({ status: true, data: user })
        } else {
            return response.send({ status: false, message: "User details has not been found." })
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
}

/**
 * Get Distributo Pincodes
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 */
module.exports.getDistributorPincodes = async function (request, response) {
    try {
        let { user_id } = request.body;

        let pincodes = await DistributorPincode.find({ distributor_id: user_id }, { pin_code: 1 });

        if (pincodes && pincodes.length > 0) {
            return response.send({ status: true, data: pincodes })
        } else {
            return response.send({ status: false, message: "Pin codes has not been found." })
        }
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" })
    }
}
