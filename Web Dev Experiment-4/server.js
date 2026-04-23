/**
 * TO-DO LIST WITH EMAIL REMINDERS
 * 
 * SETUP INSTRUCTIONS:
 * 1. Run: npm install
 * 2. Create a .env file in the root directory
 * 3. Add your Resend API key: RESEND_API_KEY=YOUR_RESEND_API_KEY_HERE
 * 4. Get your API key from: https://resend.com/
 * 5. Run: node server.js
 * 6. Open browser: http://localhost:3000
 * 
 * FEATURES:
 * - Add tasks with email reminders
 * - Edit existing tasks
 * - Delete tasks
 * - Email notifications on task creation
 * - Real-time UI updates
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server is running on http://localhost:${PORT}`);
  console.log('\n📋 To-Do List App with Email Reminders');
  console.log('📧 Remember to add your Resend API key to .env file\n');
});
