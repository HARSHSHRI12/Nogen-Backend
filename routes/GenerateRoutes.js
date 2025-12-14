// routes/generateRoutes.js
const express = require('express');
const router = express.Router();
const { generateNotes } = require('../controllers/generateController');

router.post('/', generateNotes); // /api/generate

module.exports = router;
