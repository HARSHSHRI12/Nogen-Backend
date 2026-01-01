const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { connectionSchema } = require('../utils/validation');
const { onlineUsers } = require('../socket');

// Send connection request
exports.sendRequest = async (req, res) => {
    try {
        const { error } = connectionSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { recipientId } = req.body;
        const requesterId = req.user._id;

        if (requesterId.toString() === recipientId) {
            return res.status(400).json({ error: 'You cannot connect with yourself' });
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({ error: 'Connection or request already exists' });
        }

        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        // Create Notification
        const notification = await Notification.create({
            user: recipientId,
            title: 'New Connection Request',
            message: `${req.user.name} wants to connect with you.`,
            type: 'info',
            icon: '🤝',
            link: '/network/requests'
        });

        // Real-time notification if recipient is online
        const io = req.app.get('io');
        if (io) {
            io.to(recipientId).emit('new_notification', {
                ...notification.toObject(),
                from: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
            });
        }

        res.status(201).json({ message: 'Request sent successfully', connection });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Accept connection request
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const recipientId = req.user._id;

        const connection = await Connection.findById(requestId);

        if (!connection) return res.status(404).json({ error: 'Request not found' });
        if (connection.recipient.toString() !== recipientId.toString()) {
            return res.status(403).json({ error: 'Unauthorized to accept this request' });
        }

        connection.status = 'accepted';
        await connection.save();

        // Create Notification for requester
        const notification = await Notification.create({
            user: connection.requester,
            title: 'Connection Accepted',
            message: `${req.user.name} accepted your connection request.`,
            type: 'success',
            icon: '✅',
            link: `/profile/${req.user._id}`
        });

        // Real-time notification
        const io = req.app.get('io');
        if (io) {
            io.to(connection.requester.toString()).emit('new_notification', notification.toObject());
            // Notify both that they are now connected (for chat UI)
            io.emit('connection_update', { user1: connection.requester, user2: connection.recipient });
        }

        res.json({ message: 'Request accepted', connection });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject connection request
exports.rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const recipientId = req.user._id;

        const connection = await Connection.findById(requestId);

        if (!connection) return res.status(404).json({ error: 'Request not found' });
        if (connection.recipient.toString() !== recipientId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Connection.findByIdAndDelete(requestId);
        res.json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all connections
exports.getConnections = async (req, res) => {
    try {
        const userId = req.user._id;
        const connections = await Connection.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).populate('requester recipient', 'name role avatar');

        // Extract the other user from each connection
        const friends = connections.map(conn => {
            const otherUser = conn.requester._id.toString() === userId.toString() ? conn.recipient : conn.requester;
            return {
                ...otherUser.toObject(),
                connectionId: conn._id,
                isOnline: onlineUsers.has(otherUser._id.toString())
            };
        });

        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get pending requests
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await Connection.find({
            recipient: userId,
            status: 'pending'
        }).populate('requester', 'name role avatar');

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Get all existing connections/requests
        const existing = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }]
        });

        const excludedIds = existing.map(conn =>
            conn.requester.toString() === userId.toString() ? conn.recipient : conn.requester
        );
        excludedIds.push(userId);

        // Basic suggestion by role
        let suggestions = await User.find({
            _id: { $nin: excludedIds },
            role: user.role
        }).limit(10).select('name role avatar');

        // If teachers, also suggest by same subjects
        if (user.role === 'teacher' && user.subjects && user.subjects.length > 0) {
            const subjectSuggestions = await User.find({
                _id: { $nin: [...excludedIds, ...suggestions.map(s => s._id)] },
                role: 'teacher',
                subjects: { $in: user.subjects }
            }).limit(10).select('name role avatar');

            suggestions = [...suggestions, ...subjectSuggestions];
        }

        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
