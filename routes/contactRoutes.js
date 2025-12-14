const express = require("express");
const router = express.Router();
const contactFormHandler = require("../controllers/contactController");

// No need for "/contact" here, as the path is already handled in the server.js
router.post("/", contactFormHandler); // This will be POST /api/contact

module.exports = router;
