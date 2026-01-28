const Notification = require('../models/Notification');
const User = require('../models/User');
const sendMail = require('../utils/mail');

// Replaced local transporter with unified mail utility for Gmail consistency

// Create and send notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    // Save notification to DB
    const notification = new Notification({ userId, title, message, type });
    await notification.save();

    // Send email if type is 'email'
    if (type === 'email') {
      
      const user = await User.findById(userId);
      if (!user || !user.email) {
        

        return res.status(400).json({ success: false, message: 'User email not found' });
      }

      
      await sendMail(user.email, title, message);
    }

    // Emit socket.io event if socket is available
    const io = req.app.get('io');
    if (io) {
      const count = await Notification.countDocuments({ isRead: false });
      io.emit('new-notification', { notification, count });
    }

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error('Create Notification Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all notifications, newest first, with user fullName populated
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName'); // populate only fullName from User
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark one notification as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear all notifications from DB
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};