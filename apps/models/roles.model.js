const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RolesSchema = new Schema({
    role_name: {
        type: String,
        required: true,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Number,
        default: Date.now
    }
});

// Export the model
module.exports = mongoose.model('roles', RolesSchema);