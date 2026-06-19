import { useState, useRef, useEffect } from 'react'
import MessageBubble from '../components/MessageBubble'
import EscalationAlert from '../components/EscalationAlert'

const defaultTickets = [
  {
    id: '#1023',
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
    setTickets(prev => prev.map(t => t.id === activeTicketId ? {
      ...t,
      messages: updatedMessages,
      issue: t.issue === 'New conversation' ? text.slice(0, 25) + '...' : t.issue
    } : t))
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: updatedMessages })
      })
      const data = await res.json()
      const botMsg = {
        role: 'bot',
        text: data.botResponse || data.reply,
        sentiment: data.emotion || data.sentiment,
        urgency: data.urgency
      }
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

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const greeting = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'

  const statusBg = { Resolved: 'rgba(50,200,130,0.12)', Escalated: 'rgba(255,50,50,0.12)', Pending: 'rgba(255,200,50,0.12)' }
  const statusColor = { Resolved: '#32c882', Escalated: '#ff4d6d', Pending: '#ffc832' }
  const statusBorder = { Resolved: 'rgba(50,200,130,0.2)', Escalated: 'rgba(255,50,50,0.2)', Pending: 'rgba(255,200,50,0.2)' }
  const urgencyColor = { Low: '#32c882', Medium: '#ffc832', High: '#ff8232', Critical: '#ff3232' }

  return (
    <div style={{
      maxWidth: '1500px', margin: '0 auto',
      padding: '28px 32px',
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
    }}>

      {/* Sidebar */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px', gap: '12px',
          borderLeft: '2px solid rgba(124,92,255,0.3)', paddingLeft: '10px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Recent Tickets</span>
          <button onClick={handleNewChat} className="btn-gradient" style={{ fontSize: '12px', padding: '5px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>+ New</button>
        </div>
        {tickets.map(ticket => (
          <div key={ticket.id}
            className={`ticket-card ${activeTicketId === ticket.id ? 'active' : ''}`}
            onClick={() => { setActiveTicketId(ticket.id); setEscalated(false) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{ticket.id}</span>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block',
                background: urgencyColor[ticket.urgency] || '#aaa',
                boxShadow: `0 0 8px ${urgencyColor[ticket.urgency] || '#aaa'}`
              }} />
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', lineHeight: 1.4 }}>{ticket.issue}</p>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
              background: statusBg[ticket.status],
              color: statusColor[ticket.status]
            }}>{ticket.status}</span>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            <span style={{
              background: 'linear-gradient(90deg, #ffffff, #ff6b3d)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Good {greeting}</span> 👋
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            Support Overview · Track ticket resolution, escalation trends, and customer satisfaction in real time.
          </p>
        </div>

        {escalated && <EscalationAlert onClose={() => setEscalated(false)} />}

        {/* Chat window */}
        <div className="chat-container" style={{
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 280px)',
        }}>

          {/* Chat header */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px 24px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c5cff, #4d7cff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', boxShadow: '0 0 15px rgba(124,92,255,0.4)'
              }}>🤖</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  {activeTicket?.id} · {activeTicket?.issue}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                  ResolvBot AI · Always active
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '999px',
              background: statusBg[activeTicket?.status],
              color: statusColor[activeTicket?.status],
              border: `1px solid ${statusBorder[activeTicket?.status]}`
            }}>{activeTicket?.status}</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTicket?.messages.map((msg, i) => (
              <div key={i} className="fade-in">
                {msg.role === 'bot' ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7c5cff, #4d7cff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', boxShadow: '0 0 10px rgba(124,92,255,0.3)', marginTop: '2px'
                    }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <MessageBubble msg={msg} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <MessageBubble msg={msg} />
                    <div style={{ textAlign: 'right', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', paddingRight: '4px' }}>{timeStr}</div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c5cff, #4d7cff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                }}>🤖</div>
                <div className="bot-bubble" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="dot-1" style={{ width: '7px', height: '7px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'inline-block' }} />
                  <span className="dot-2" style={{ width: '7px', height: '7px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'inline-block' }} />
                  <span className="dot-3" style={{ width: '7px', height: '7px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'inline-block' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'center',
            borderRadius: '0 0 24px 24px',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.25)' }}>📎</div>
            <input
              id="chat-input"
              className="input-dark"
              placeholder="Describe your issue..."
              onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleSend(e.target.value)
                  e.target.value = ''
                }
              }}
              disabled={loading}
            />
            <div style={{ fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.25)' }}>✨</div>
            <button
              onClick={() => {
                const input = document.getElementById('chat-input')
                if (input && input.value.trim()) { handleSend(input.value); input.value = '' }
              }}
              disabled={loading}
              className="btn-gradient"
              style={{ padding: '10px 24px', fontSize: '14px', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1 }}
            >
              Send ➜
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}