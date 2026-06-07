const axios = require('axios');

const analyzeComplaint = async (userMessage, conversationHistory = []) => {

  const systemPrompt = `You are an intelligent Customer Complaint Resolution Bot for an e-commerce platform.

Your job is to:
1. Understand the customer's complaint
2. Detect their emotion (angry, frustrated, neutral, calm, satisfied)
3. Classify urgency (Low, Medium, High, Critical)
4. Provide a helpful resolution or step-by-step solution
5. Decide if escalation to a human agent is needed

Escalate to human agent if:
- Customer is very angry or uses aggressive language
- Issue involves payment fraud or account security
- Problem has not been resolved after 2 attempts
- Customer explicitly asks for a human agent

Always respond in this exact JSON format:
{
  "botResponse": "Your friendly response to the customer here",
  "emotion": "angry | frustrated | neutral | calm | satisfied",
  "urgency": "Low | Medium | High | Critical",
  "category": "order | refund | payment | delivery | account | product | other",
  "escalate": true or false,
  "escalationReason": "reason here or null if not escalating",
  "resolved": true or false
}`;

  let fullMessage = userMessage;
  if (conversationHistory.length > 0) {
    fullMessage = 'Conversation so far:\n' +
      conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') +
      '\n\nLatest customer message: ' + userMessage;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemma-4-31b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullMessage }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = response.data.choices[0].message.content;
    const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    return parsed;

  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    return {
      botResponse: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      emotion: "neutral",
      urgency: "Low",
      category: "other",
      escalate: false,
      escalationReason: null,
      resolved: false
    };
  }
};

module.exports = { analyzeComplaint };