const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DeliveryPartnerSchema = new Schema({
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'brands',
        required: true
    },
    brand_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    api_key: {
        type: String,
        required: true
    },
    partner_name: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('delivery_partners', DeliveryPartnerSchema);