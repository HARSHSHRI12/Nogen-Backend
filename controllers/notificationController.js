const Notification = require('../models/Notification');

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    console.log('📍 getNotifications - User ID:', req.user._id);
    
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    console.log('✅ Notifications fetched:', notifications.length, 'Unread:', unreadCount);
    
    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ user: req.user._id }),
    });
  } catch (err) {
    console.error('❌ getNotifications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('✅ Notification marked as read:', notificationId);
    res.json(notification);
  } catch (err) {
    console.error('❌ markAsRead error:', err.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    console.log('✅ All notifications marked as read:', result.modifiedCount);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('❌ markAllAsRead error:', err.message);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: notificationId });
    console.log('✅ Notification deleted:', notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('❌ deleteNotification error:', err.message);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });
    console.log('✅ All notifications cleared:', result.deletedCount);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('❌ clearAllNotifications error:', err.message);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

// Create notification (for admin/system use)
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'info', icon = 'ℹ️', link = null } = req.body;

    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      icon,
      link,
    });

    await notification.save();
    console.log('✅ Notification created:', notification._id);
    res.status(201).json(notification);
  } catch (err) {
    console.error('❌ createNotification error:', err.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};
