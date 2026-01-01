const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const teacherMiddleware = require('../middleware/teacherMiddleware');
const upload = require('../config/multer');

// @route   POST /api/upload/syllabus
// @desc    Upload syllabus (teacher)
// @access  Private (teacher)
router.post('/syllabus', authMiddleware, teacherMiddleware, upload.single('syllabus'), uploadController.uploadSyllabus);

// @route   POST /api/upload/materials
// @desc    Upload teaching materials (teacher)
// @access  Private (teacher)
router.post('/materials', authMiddleware, teacherMiddleware, upload.array('materials', 5), uploadController.uploadMaterials);

// @route   POST /api/upload/assignment
// @desc    Create assignment (teacher)
// @access  Private (teacher)
router.post('/assignment', authMiddleware, teacherMiddleware, uploadController.createAssignment);

// @route   PUT /api/upload/assignment/:id
// @desc    Update assignment (teacher)
// @access  Private (teacher)
router.put('/assignment/:id', authMiddleware, teacherMiddleware, uploadController.updateAssignment);

// @route   POST /api/upload/profile-pic
// @desc    Upload user profile picture
// @access  Private
router.post('/profile-pic', authMiddleware, upload.single('profilePic'), uploadController.uploadProfilePic);

// @route   POST /api/upload/image
// @desc    Upload general image (for posts, etc.)
// @access  Private
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);

module.exports = router;