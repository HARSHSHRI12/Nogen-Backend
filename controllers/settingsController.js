const UserSettings = require('../models/UserSettings');

// Get user settings
exports.getSettings = async (req, res) => {
  try {
    console.log('📍 getSettings - User ID:', req.user._id);
    
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      // Create default settings if not exist
      settings = new UserSettings({ user: req.user._id });
      await settings.save();
      console.log('✅ Created default settings for user');
    }
    
    console.log('✅ Settings retrieved:', settings);
    res.json(settings);
  } catch (err) {
    console.error('❌ getSettings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    console.log('📍 updateSettings - User ID:', req.user._id);
    console.log('📍 updateSettings - Body:', req.body);
    
    const allowedFields = [
      'darkMode',
      'emailNotifications',
      'pushNotifications',
      'profileVisibility',
      'showEmail',
      'autoPlayVideos',
      'defaultLanguage',
      'newsLetterSubscribed',
      'twoFactorAuth',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    let settings = await UserSettings.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log('✅ Settings updated:', settings);
    res.json(settings);
  } catch (err) {
    console.error('❌ updateSettings error:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Get a specific setting
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings || !settings.hasOwnProperty(key)) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ [key]: settings[key] });
  } catch (err) {
    console.error('❌ getSetting error:', err.message);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};
