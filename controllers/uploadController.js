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
  
  module.exports = {
    uploadSyllabus,
    uploadMaterials,
    createAssignment,
    updateAssignment,
  };
  