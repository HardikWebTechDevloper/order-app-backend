const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrdersSchema = new Schema({
    order_datetime: {
        type: Date,
        default: Date.now()
    },
    order_status: {
        type: String,
        enum: ['OPEN', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'SCHEDULED', 'DELIVED', 'VIEW', 'RETURN'],
        default: 'OPEN'
    },
    amount: {
        type: Number,
        required: true
    },
    deliver_by: {
        type: String,
        enum: ['DUNZO', 'SELF'],
        default: 'SELF'
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
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('orders', OrdersSchema);