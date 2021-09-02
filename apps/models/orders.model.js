const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrdersSchema = new Schema({
    order_datetime: {
        type: Date,
        default: Date.now()
    },
    order_status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'SCHEDULED', 'DELIVERED', 'VIEW', 'RETURN'],
        default: 'PENDING'
    },
    amount: {
        type: Number,
        required: true
    },
    deliver_by: {
        type: String,
        enum: ['', 'DUNZO', 'SELF'],
        default: ''
    },
    pincode: {
        type: Number,
        required: true
    },
    distributor_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    order_details: {
        type: String,
        required: true
    },
    order_otp: {
        type: Number,
        required: false
    },
    status_updated_at: {
        type: Date,
        required: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('orders', OrdersSchema);