import { useState, useRef, useEffect } from 'react'
import MessageBubble from '../components/MessageBubble'
import ChatBox from '../components/ChatBox'
import EscalationAlert from '../components/EscalationAlert'

const defaultTickets = [
  {
    id:  '#1023',
    issue: 'Order not arrived',
    status: 'Escalated',
    urgency: 'Critical',
    messages: [
      { role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' },
      { role: 'user', text: 'My order has not arrived and it has been 2 weeks!' },
      { role: 'bot', text: 'I\'m really sorry to hear that! Let me look into your order right away. Can you share your order ID?', sentiment: 'Frustrated', urgency: 'High' },
      { role: 'user', text: 'This is absolutely ridiculous I want a refund NOW' },
      { role: 'bot', text: 'I completely understand your frustration. I am escalating this to our senior team immediately.', sentiment: 'Angry', urgency: 'Critical' },
    ]
  },
  {
    id: '#1022',
    issue: 'Wrong item delivered',
    status: 'Resolved',
    urgency: 'High',
    messages: [
      { role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' },
      { role: 'user', text: 'I received the wrong item in my order' },
      { role: 'bot', text: 'I\'m sorry about that! Can you share your order ID and a photo of the wrong item?', sentiment: 'Frustrated', urgency: 'High' },
      { role: 'user', text: 'My order ID is #45678' },
      { role: 'bot', text: 'Thank you! I\'ve raised a replacement request. You\'ll receive the correct item within 3-5 business days.', sentiment: 'Calm', urgency: 'Low' },
    ]
  },
  {
    id: '#1021',
    issue: 'Refund not received',
    status: 'Pending',
    urgency: 'Medium',
    messages: [
      { role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' },
      { role: 'user', text: 'I requested a refund 5 days ago but haven\'t received it' },
      { role: 'bot', text: 'Refunds typically take 5-7 business days. Can you share your order ID so I can check the status?', sentiment: 'Neutral', urgency: 'Medium' },
    ]
  },
  {
    id: '#1020',
    issue: 'Payment failed',
    status: 'Resolved',
    urgency: 'Low',
    messages: [
      { role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' },
      { role: 'user', text: 'My payment failed yesterday' },
      { role: 'bot', text: 'I\'m sorry to hear that! Please check if your card details are up to date. You can retry the payment from your Order History.', sentiment: 'Calm', urgency: 'Low' },
      { role: 'user', text: 'It worked now thank you!' },
      { role: 'bot', text: 'Great to hear! Let me know if you need anything else.', sentiment: 'Calm', urgency: 'Low' },
    ]
  },
]

export default function ChatPage() {
  const [tickets, setTickets] = useState(defaultTickets)
  const [activeTicketId, setActiveTicketId] = useState('#1023')
  const [escalated, setEscalated] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const activeTicket = tickets.find(t => t.id === activeTicketId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeTicket?.messages])

  const handleNewChat = () => {
    const newId = '#' + (1030 + tickets.length)
    const newTicket = {
      id: newId,
      issue: 'New conversation',
      status: 'Pending',
      urgency: 'Low',
      messages: [{ role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' }]
    }
    setTickets(prev => [newTicket, ...prev])
    setActiveTicketId(newId)
    setEscalated(false)
  }

  const handleSend = async (text) => {
    if (!text.trim()) return
    const updatedMessages = [...activeTicket.messages, { role: 'user', text }]
    setTickets(prev => prev.map(t => t.id === activeTicketId ? { ...t, messages: updatedMessages, issue: t.issue === 'New conversation' ? text.slice(0, 25) + '...' : t.issue } : t))
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: activeTicketId })
      })
      const data = await res.json()
      const botMsg = { role: 'bot', text: data.botResponse || data.reply, sentiment: data.emotion || data.sentiment, urgency: data.urgency }
      setTickets(prev => prev.map(t => t.id === activeTicketId ? {
        ...t,
        messages: [...updatedMessages, botMsg],
        status: data.escalate ? 'Escalated' : 'Resolved',
        urgency: data.urgency || t.urgency
      } : t))
      if (data.escalate) setEscalated(true)
    } catch {
      setTickets(prev => prev.map(t => t.id === activeTicketId ? {
        ...t,
        messages: [...updatedMessages, { role: 'bot', text: '⚠️ Could not connect to server. Make sure the backend is running.' }]
      } : t))
    }
    setLoading(false)
  }

  const statusStyle = {
    'Resolved': 'bg-green-100 text-green-700',
    'Escalated': 'bg-red-100 text-red-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
  }

  const urgencyDot = {
    'Low': 'bg-green-400',
    'Medium': 'bg-yellow-400',
    'High': 'bg-orange-400',
    'Critical': 'bg-red-500',
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 flex gap-4">

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">Recent Tickets</h3>
          <button
            onClick={handleNewChat}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
          >
            + New
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => { setActiveTicketId(ticket.id); setEscalated(false) }}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${activeTicketId === ticket.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">{ticket.id}</span>
                <span className={`w-2 h-2 rounded-full ${urgencyDot[ticket.urgency] || 'bg-gray-300'}`}></span>
              </div>
              <p className="text-xs text-gray-700 mb-2 leading-snug">{ticket.issue}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[ticket.status]}`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1">
        {escalated && <EscalationAlert onClose={() => setEscalated(false)} />}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[70vh]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">{activeTicket?.id}</span>
              <span className="text-xs text-gray-400 ml-2">{activeTicket?.issue}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[activeTicket?.status]}`}>
              {activeTicket?.status}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {activeTicket?.messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full dot-1 inline-block"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full dot-2 inline-block"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full dot-3 inline-block"></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <ChatBox onSend={handleSend} disabled={loading} />
        </div>
      </div>

    </div>
  )
}