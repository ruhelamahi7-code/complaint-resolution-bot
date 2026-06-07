const dotenv = require('dotenv');
dotenv.config(); // This MUST be first before anything else

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');

app.use('/api', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Complaint Resolution Bot Backend is running! 🚀' });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});