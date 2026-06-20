const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');

// API routes
app.use('/api', chatRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Root API endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Complaint Resolution Bot Backend is running! 🚀' });
});

// Catch-all for React routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});