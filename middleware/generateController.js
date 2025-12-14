// controllers/generateController.js
const GeminiService = require('../services/GeminiService');
const DeepAIService = require('../services/DeepAIService');
const StarryAIService = require('../services/StarryAIService');

// Generate basic notes
exports.generateBasicNotes = async (req, res) => {
  try {
    const { topic, subject, year } = req.body;
    const notes = await GeminiService.generateBasicNotes(topic, subject, year);
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error('Basic Notes Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate basic notes' });
  }
};

// Generate advanced notes with examples, images, and depth
exports.generateAdvancedNotes = async (req, res) => {
  try {
    const { topic, subject, year, depth } = req.body;
    const [geminiNotes, deepAIExamples, starryImages] = await Promise.all([
      GeminiService.generateAdvancedNotes(topic, subject, year, depth),
      DeepAIService.generateExamples(topic),
      StarryAIService.generateImages(topic)
    ]);

    const finalNotes = {
      ...geminiNotes,
      examples: deepAIExamples,
      images: starryImages
    };

    res.status(200).json({ success: true, notes: finalNotes });
  } catch (error) {
    console.error('Advanced Notes Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate advanced notes' });
  }
};

// Generate content for teachers
exports.generateTeacherContent = async (req, res) => {
  try {
    const { syllabus, durationDays } = req.body;
    const structuredContent = await GeminiService.generateTeachingPlan(syllabus, durationDays);
    res.status(200).json({ success: true, plan: structuredContent });
  } catch (error) {
    console.error('Teacher Content Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate teacher content' });
  }
};
