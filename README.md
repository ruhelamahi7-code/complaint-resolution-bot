# 🤖 ResolvBot — AI Complaint Resolution Bot

> Built for **FlowZint AI Hackathon 2026** on Unstop

---

## 💡 What is ResolvBot?

ResolvBot is an AI-powered customer support agent that intelligently resolves customer complaints in real time. It detects emotions, classifies urgency, auto-resolves simple issues, and escalates critical ones to human agents — all through a beautiful chat interface.

---

## ✨ Features

- 💬 **Real-time AI chat** powered by Google Gemini
- 😤 **Sentiment detection** — Angry, Frustrated, Neutral, Calm
- ⚡ **Urgency classification** — Low, Medium, High, Critical
- 🚨 **Smart escalation** to human agents with full conversation summary
- 🎫 **Ticket history** with filter tabs (All / Pending / Escalated / Resolved)
- 📊 **Live analytics dashboard** — real-time complaint insights
- 💾 **Persistent tickets** — saved across sessions
- 🌙 **Premium dark UI** — Nextmind-inspired glassmorphism design

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Google Gemini API |
| Deployment | Railway |
| Version Control | GitHub |

---

## 👥 Team

| Name | Role |
|---|---|
| Mahi Ruhela | Frontend — React, UI/UX, Chat Interface |
| Ity Shree | Backend — Node.js, Gemini API, Analytics |

---

## 🏃 How to Run Locally

### Backend
\`\`\`bash
cd complaint-resolution-bot
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
node server.js
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open **http://localhost:5173**

---

## 📁 Project Structure

\`\`\`
complaint-resolution-bot/
├── frontend/          # React app (Mahi Ruhela)
│   ├── src/
│   │   ├── pages/     # ChatPage, DashboardPage
│   │   ├── components/# MessageBubble, ChatBox, etc.
│   │   └── App.jsx
├── src/               # Backend (Ity Shree)
│   ├── routes/        # chat, analytics routes
│   └── services/      # AI service, stats store
└── server.js
\`\`\`

---

## 🎯 How It Works

1. Customer types a complaint in the chat
2. Message is sent to the backend → Gemini AI analyses it
3. AI detects **sentiment** and **urgency level**
4. Bot responds appropriately:
   - Low urgency → auto-resolves with helpful response
   - High urgency → guided step-by-step resolution
   - Critical / very angry → escalates to human agent
5. Every interaction updates the **live analytics dashboard**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message, get AI response |
| GET | /api/tickets | Get all complaint tickets |
| GET | /api/analytics | Get dashboard statistics |
| GET | /api/escalation-summary/:sessionId | Get escalation summary |

---

*Made with ❤️ by Mahi Ruhela & Ity Shree for FlowZint AI Hackathon 2026*
