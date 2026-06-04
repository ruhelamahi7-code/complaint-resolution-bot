import { useState, useRef, useEffect } from 'react'
import MessageBubble from '../components/MessageBubble'
import ChatBox from '../components/ChatBox'
import EscalationAlert from '../components/EscalationAlert'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m ResolvBot 👋 Please describe your issue and I\'ll help you resolve it.' },
    { role: 'user', text: 'My order has not arrived and it has been 2 weeks!' },
    { role: 'bot', text: 'I\'m really sorry to hear that! Let me look into your order right away. Can you share your order ID?', sentiment: 'Frustrated', urgency: 'High' },
    { role: 'user', text: 'This is absolutely ridiculous I want a refund NOW' },
    { role: 'bot', text: 'I completely understand your frustration. I am escalating this to our senior team immediately.', sentiment: 'Angry', urgency: 'Critical' },
  ])
  const [escalated, setEscalated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState([
    { id: '#1023', issue: 'Order not arrived', status: 'Escalated', urgency: 'Critical' },
    { id: '#1022', issue: 'Wrong item delivered', status: 'Resolved', urgency: 'High' },
    { id: '#1021', issue: 'Refund not received', status: 'Pending', urgency: 'Medium' },
    { id: '#1020', issue: 'Payment failed', status: 'Resolved', urgency: 'Low' },
  ])
  const [activeTicket, setActiveTicket] = useState('#1023')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    if (!text.trim()) return
    const updated = [...messages, { role: 'user', text }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: updated })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply, sentiment: data.sentiment, urgency: data.urgency }])
      if (data.escalate) setEscalated(true)

      setTickets(prev => [{
        id: '#' + (1024 + prev.length),
        issue: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        status: data.escalate ? 'Escalated' : 'Resolved',
        urgency: data.urgency || 'Low'
      }, ...prev])

    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Could not connect to server. Make sure the backend is running.' }])
    }
    setLoading(false)
  }

  const statusStyle = {
    'Resolved':  'bg-green-100 text-green-700',
    'Escalated': 'bg-red-100 text-red-700',
    'Pending':   'bg-yellow-100 text-yellow-700',
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
        <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Tickets</h3>
        <div className="flex flex-col gap-2">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicket(ticket.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${activeTicket === ticket.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
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
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
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