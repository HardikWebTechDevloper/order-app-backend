const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CitiesSchema = new Schema({
    city_name: {
        type: String,
        required: true,
        trim: true
    },
    state_id: {
        type: Schema.Types.ObjectId,
        ref: 'states',
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
module.exports = mongoose.model('cities', CitiesSchema);