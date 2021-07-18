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
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Export the model
module.exports = mongoose.model('roles', RolesSchema);