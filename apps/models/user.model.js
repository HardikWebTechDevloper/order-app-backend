const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

let UsersSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    role_id: {
        type: Schema.Types.ObjectId,
        ref: 'roles',
        required: true
    },
    city_id: {
        type: Schema.Types.ObjectId,
        ref: 'cities',
        required: false
    },
    state_id: {
        type: Schema.Types.ObjectId,
        ref: 'states',
        required: false
    },
    country_id: {
        type: Schema.Types.ObjectId,
        ref: 'countries',
        required: false
    },
    pin_code: {
        type: Number,
        required: false,
        trim: true,
        maxlength: 10
    },
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'brands',
        required: false
    },
    brand_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    distributor_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    distributor_commision: {
        type: Number,
        required: false,
        default: 0
    },
    distributor_tax_details: {
        type: String,
        required: false,
        default: null
    },
    otp: {
        type: Number,
        required: false,
        maxlength: 6
    },
    otpSentAt: {
        type: Number, default: null
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        required: false
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UsersSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

UsersSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);

    user.tokens = user.tokens.concat({ token });

    await user.save();
    return token;
}

UsersSchema.statics.findByCredentials = async (phone, otp) => {
    // Search for a user by phone.
    const isPhoneMatch = await User.findOne({ phone })
    if (!isPhoneMatch) {
        throw new Error({ error: 'Phone number has not been matched with our records.' })
    }

    // Search for a user by phone and otp
    const isOTPMatch = await User.findOne({ phone, otp })
    if (!isOTPMatch) {
        throw new Error({ error: 'Invalid OTP. Please enter valid OTP code.' })
    }

    return isOTPMatch;
}

// Export the model
module.exports = mongoose.model('users', UsersSchema);