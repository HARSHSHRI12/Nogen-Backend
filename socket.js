const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                const normalizedOrigin = origin.replace(/\/$/, "");
                if (normalizedOrigin === "http://localhost:3000" || normalizedOrigin.endsWith(".netlify.app")) {
                    return callback(null, true);
                }
                return callback(null, false);
            },
            credentials: true
        }
    });

    // Socket Authentication Middleware
    io.use(async (socket, next) => {
        try {
            let token = socket.handshake.auth.token;

            if (!token && socket.handshake.headers.cookie) {
                const cookies = socket.handshake.headers.cookie.split(';');
                const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
                if (tokenCookie) {
                    token = tokenCookie.split('=')[1].trim();
                }
            }

            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: ' + err.message));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Add user to online users
        onlineUsers.set(socket.user._id.toString(), socket.id);
        io.emit('user_online', socket.user._id);

        // Join personal room for private notifications
        socket.join(socket.user._id.toString());

        socket.on('join_chat', async (otherUserId) => {
            try {
                const Connection = require('./models/Connection');
                const isConnected = await Connection.findOne({
                    $or: [
                        { requester: socket.user._id, recipient: otherUserId, status: 'accepted' },
                        { requester: otherUserId, recipient: socket.user._id, status: 'accepted' }
                    ]
                });

                if (!isConnected) {
                    return socket.emit('error', 'You are not connected with this user');
                }

                const roomId = [socket.user._id.toString(), otherUserId].sort().join('_');
                socket.join(roomId);
                console.log(`User ${socket.user.name} joined room: ${roomId}`);
            } catch (err) {
                console.error('Socket join_chat error:', err);
            }
        });

        socket.on('send_message', async (data) => {
            const { recipientId, content } = data;
            const roomId = [socket.user._id.toString(), recipientId.toString()].sort().join('_');
            console.log(`[Socket] Message from ${socket.user.name} to ${recipientId} in room: ${roomId}`);

            try {
                const newMessage = await Message.create({
                    sender: socket.user._id,
                    recipient: recipientId,
                    content
                });

                const messageData = {
                    _id: newMessage._id,
                    sender: socket.user._id,
                    recipient: recipientId,
                    content,
                    createdAt: newMessage.createdAt
                };

                console.log(`[Socket] Emitting receive_message to room: ${roomId}`);
                io.to(roomId).emit('receive_message', messageData);

                // If recipient is online but not in room, send notification
                const recipientSocketId = onlineUsers.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientId).emit('new_notification', {
                        type: 'message',
                        title: `New message from ${socket.user.name}`,
                        message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                        senderId: socket.user._id
                    });
                }
            } catch (err) {
                console.error('Error sending message:', err);
            }
        });

        socket.on('typing', (data) => {
            const { recipientId, isTyping } = data;
            const roomId = [socket.user._id.toString(), recipientId].sort().join('_');
            socket.to(roomId).emit('user_typing', { userId: socket.user._id, isTyping });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
            onlineUsers.delete(socket.user._id.toString());
            io.emit('user_offline', socket.user._id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, onlineUsers };
