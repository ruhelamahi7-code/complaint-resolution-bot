const express = require('express');
const router = express.Router();
const { analyzeComplaint } = require('../services/geminiService');

// POST /api/chat
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Received message:', message);
    
    const aiResponse = await analyzeComplaint(message, history);

    console.log('AI Response:', aiResponse);

    res.json({
      botResponse: aiResponse.botResponse,
      sentiment: aiResponse.emotion || aiResponse.sentiment,
      urgency: aiResponse.urgency,
      escalate: aiResponse.escalate
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

module.exports = router;