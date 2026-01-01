const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    media: {
        type: {
            type: String,
            enum: ['photo', 'video', 'article']
        },
        url: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    shares: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
