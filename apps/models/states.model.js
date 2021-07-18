const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let StatesSchema = new Schema({
    state_name: {
        type: String,
        required: true,
        trim: true
    },
    country_id: {
        type: Schema.Types.ObjectId,
        ref: 'countries',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('states', StatesSchema);