const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BlogsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false
    },
    comments: [{
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        comment: {
            type: String,
            required: true,
        }
    }],
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('blogs', BlogsSchema);