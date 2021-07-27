const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrdersSchema = new Schema({
    order_datetime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    order_status_id: {
        type: Schema.Types.ObjectId,
        ref: 'order_statuses',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    deliver_by_id: {
        type: Schema.Types.ObjectId,
        ref: 'order_statuses',
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'brands',
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
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('orders', OrdersSchema);