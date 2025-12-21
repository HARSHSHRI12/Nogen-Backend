const UserSettings = require('../models/UserSettings');
const mongoose = require('mongoose');

// GET SETTINGS
const getSettings = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  if (req.user._id.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized.' });
  }

  try {
    let userSettings = await UserSettings.findOne({ userId });

    if (!userSettings) {
      userSettings = await UserSettings.create({ userId });
      return res.status(201).json({ settings: userSettings.settings });
    }

    res.status(200).json({ settings: userSettings.settings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE SETTINGS
const updateSettings = async (req, res) => {
  const { userId } = req.params;
  const { settings } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  if (req.user._id.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized.' });
  }

  try {
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { settings } },
      { new: true, upsert: true }
    );

    res.status(200).json({ settings: userSettings.settings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };
