const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Profile = require('../models/Profile');



// Register User (Signup)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Trim and validate password
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      return res.status(400).json({ errors: [{ msg: 'Password cannot be empty' }] });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    // Create new user with hashed password
    user = new User({
      name,
      email: email.toLowerCase().trim(), // Normalize email
      password: hashedPassword,
      role,
    });

    await user.save();

    // Return JWT token
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
};

// Login User 
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: "Invalid credentials",
          debug: {
            reason: "Password does not match stored hash",
            solution: "1. Ensure correct password 2. Reset password if needed"
          }
        }]
      });
    }

    // ✅ Profile auto-creation logic
    const existingProfile = await Profile.findOne({ user: user._id });

    if (!existingProfile) {
      const newProfile = new Profile({
        user: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: "",
        skills: [],
        goals: "",
        avatar: "https://i.ibb.co/MBtjqXQ/no-avatar.gif"
      });

      await newProfile.save();
    }

    // ✅ JWT token generation
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      msg: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errors: [{ msg: "Server error, please try again later" }]
    });
  }
};



// Get user data (protected route)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot password (send reset token)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'User not found' }] });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Password reset link: \n\n ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired token' }] });
    }

    // Trim and validate new password
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      return res.status(400).json({ errors: [{ msg: 'Password cannot be empty' }] });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(trimmedPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};