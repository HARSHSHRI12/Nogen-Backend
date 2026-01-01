const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { postSchema, commentSchema } = require('../utils/validation');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { error } = postSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { content, media } = req.body;

        console.log('Creating post with:', { content, media, author: req.user._id });

        const post = await Post.create({
            author: req.user._id,
            content,
            media
        });

        const populatedPost = await post.populate('author', 'name avatar role');
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error('createPost error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get all posts (paginated)
exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('author', 'name avatar role')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'name avatar' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);

            // Create notification for author if someone else likes
            if (post.author.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    user: post.author,
                    title: 'Post Liked',
                    message: `${req.user.name} liked your post.`,
                    type: 'info',
                    icon: '❤️',
                    link: `/posts/${postId}`
                });

                const io = req.app.get('io');
                if (io) {
                    io.to(post.author.toString()).emit('new_notification', notification.toObject());
                }
            }
        }

        await post.save();
        res.json({ likes: post.likes, isLiked: !isLiked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add comment to a post
exports.addComment = async (req, res) => {
    try {
        const { error } = commentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = await Comment.create({
            post: postId,
            author: req.user._id,
            content
        });

        post.comments.push(comment._id);
        await post.save();

        // Create notification for author
        if (post.author.toString() !== req.user._id.toString()) {
            const notification = await Notification.create({
                user: post.author,
                title: 'New Comment',
                message: `${req.user.name} commented on your post: "${content.substring(0, 20)}..."`,
                type: 'info',
                icon: '💬',
                link: `/posts/${postId}`
            });

            const io = req.app.get('io');
            if (io) {
                io.to(post.author.toString()).emit('new_notification', notification.toObject());
            }
        }

        const populatedComment = await comment.populate('author', 'name avatar');
        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        await Comment.deleteMany({ post: postId });
        await Post.findByIdAndDelete(postId);

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
