// routes/generateRoutes.js
const express = require('express');
const router = express.Router();
const { generateNotes, generateTutorResponse } = require('../controllers/generateController');

router.post('/', generateNotes); // /api/generate
router.post('/tutor', generateTutorResponse);

module.exports = router;
