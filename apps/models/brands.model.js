const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BrandssSchema = new Schema({
    brand_name: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        required: true,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('brands', BrandssSchema);