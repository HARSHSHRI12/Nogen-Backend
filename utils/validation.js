const Joi = require('joi');

const connectionSchema = Joi.object({
    recipientId: Joi.string().required().hex().length(24),
});

const postSchema = Joi.object({
    content: Joi.string().required().min(1).max(5000),
    media: Joi.object({
        type: Joi.string().valid('photo', 'video', 'article'),
        url: Joi.string().uri()
    }).allow(null),
});

const commentSchema = Joi.object({
    content: Joi.string().required().min(1).max(1000),
});

module.exports = {
    connectionSchema,
    postSchema,
    commentSchema,
};
