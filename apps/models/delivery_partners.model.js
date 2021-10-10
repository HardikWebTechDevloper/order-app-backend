const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CURRENT DUNZO DETAILS
// HOST_NAME=https://apis-staging.dunzo.in
// CLIENT_ID=b8815ce7-bc62-46e7-883c-26e5e30f95f8
// CLIENT_PASSWORD=895f441c-963f-4788-a1a8-f4704a302776

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
    delivery_partner_name: {
        type: String,
        required: true
    },
    host_name: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true
    },
    client_password: {
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