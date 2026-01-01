const Profile = require('../models/Profile');

// controllers/uploadController.js

// Syllabus Upload
const uploadSyllabus = (req, res) => {
  try {
    // Access file through req.file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'Syllabus uploaded successfully!', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Teaching Materials Upload
const uploadMaterials = (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    res.status(200).json({ message: 'Materials uploaded successfully!', files });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create Assignment
const createAssignment = (req, res) => {
  try {
    // Example: Get data from req.body
    const { title, description, dueDate } = req.body;
    res.status(201).json({
      message: 'Assignment created successfully!',
      assignment: { title, description, dueDate }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Assignment
const updateAssignment = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    res.status(200).json({
      message: `Assignment ${id} updated successfully!`,
      updatedData: { title, description, dueDate }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Upload Profile Picture
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Construct the URL of the uploaded file
    const profilePicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Find the user's profile and update the profilePic field
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: { profilePic: profilePicUrl },
        $setOnInsert: {
          name: req.user.name || 'New User',
          email: req.user.email || 'user@example.com',
          role: req.user.role || 'student'
        }
      },
      { new: true, upsert: true }
    ).populate('user', ['role']);

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    res.json(profile);

  } catch (err) {
    console.error('uploadProfilePic error:', err.message);
    res.status(500).send('Server Error');
  }
};

// Upload General Image (for posts, etc.)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Construct the URL of the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });

  } catch (err) {
    console.error('uploadImage error:', err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  uploadSyllabus,
  uploadMaterials,
  createAssignment,
  updateAssignment,
  uploadProfilePic,
  uploadImage,
};
