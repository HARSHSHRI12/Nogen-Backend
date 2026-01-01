const Message = require('../models/Message');
const Connection = require('../models/Connection');

// Get messages between current user and another user
exports.getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user._id;

        // Check if connected
        const connection = await Connection.findOne({
            $or: [
                { requester: userId, recipient: otherUserId, status: 'accepted' },
                { requester: otherUserId, recipient: userId, status: 'accepted' }
            ]
        });

        if (!connection) {
            return res.status(403).json({ error: 'You can only chat with connected users' });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { sender: otherUserId, recipient: userId, read: false },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
