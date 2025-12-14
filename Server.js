const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

//  Import Routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const runCodeRoutes = require('./routes/runCodeRoute'); //  NEW IMPORT

const app = express();

//  Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/generate', require('./routes/GenerateRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/submit', require('./routes/submissionRoutes'));
app.use('/api/contact', contactRoutes);
app.use('/api', runCodeRoutes); //  Route for code execution

//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

//  Catch-all 404 handler
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//  Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

//  Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
