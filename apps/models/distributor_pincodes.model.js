const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DistributorPincodeSchema = new Schema({
    distributor_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    pin_code: {
        type: Number,
        required: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('distributor_pincodes', DistributorPincodeSchema);