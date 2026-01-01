const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// POST /api/user/profile/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.filename },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('uploadAvatar error:', err.message);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

// GET /api/user/notes
const getUserNotes = async (req, res) => {
  try {
    // Replace with actual logic to fetch user's notes
    res.status(200).json({ message: 'User notes fetched successfully', notes: [] });
  } catch (err) {
    console.error('getNotes error:', err.message);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

// GET /api/user/classes
const getTeacherClasses = async (req, res) => {
  try {
    // Replace with actual logic to fetch teacher's classes
    res.status(200).json({ message: 'Teacher classes fetched successfully', classes: [] });
  } catch (err) {
    console.error('getClasses error:', err.message);
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

// GET /api/user/:userId
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name avatar role subjects institution');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserNotes,
  getTeacherClasses,
  getUserById
};
