const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UnConfirmedOrderSchema = new Schema({
    order_no: {
        type: String,
        required: true
    },
    payment_mode: {
        type: String,
        enum: ['', 'cod', 'prepaid'],
        default: ''
    },
    pincode: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        enum: ['', 'cod', 'prepaid'],
        default: ''
    },
    order_details: {
        type: String,
        required: true
    },
    order_datetime: {
        type: Date,
        default: Date.now()
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('unconfirmed_orders', UnConfirmedOrderSchema);