import { useEffect, useRef, useState } from 'react'

export default function DashboardPage() {
  const canvasRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = () => {
    fetch('https://complaint-resolution-bot-production.up.railway.app/api/analytics')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const sentimentColorMap = {
    angry: '#ff4d6d', frustrated: '#ffc832', neutral: '#888780',
    calm: '#32c882', satisfied: '#4d7cff', happy: '#32c882',
  }

  const sentiments = data?.sentimentCounts
    ? Object.entries(data.sentimentCounts).map(([label, count]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        count,
        color: sentimentColorMap[label.toLowerCase()] || '#888780'
      }))
    : []

  const urgencies = data?.urgencyCounts
    ? Object.entries(data.urgencyCounts).map(([label, count]) => ({
        label,
        count,
        color: { Low: '#32c882', Medium: '#ffc832', High: '#ff8232', Critical: '#ff3232' }[label] || '#888780'
      }))
    : []

  const totalSentiment = sentiments.reduce((sum, s) => sum + s.count, 0)
  const totalUrgency = urgencies.reduce((sum, u) => sum + u.count, 0)

  const statCards = data ? [
    { label: 'Total Complaints', value: data.total, trend: '↗ All time', color: '#7c5cff' },
    { label: 'Auto Resolved', value: data.resolved, trend: `✓ ${data.resolutionRate}% resolution rate`, color: '#32c882' },
    { label: 'Escalated', value: data.escalated, trend: '⚠ Needs review', color: '#ff4d6d' },
    { label: 'Pending', value: data.pending, trend: '⏳ In queue', color: '#ffc832' },
  ] : [
    { label: 'Total Complaints', value: '—', trend: 'Loading...', color: '#7c5cff' },
    { label: 'Auto Resolved', value: '—', trend: 'Loading...', color: '#32c882' },
    { label: 'Escalated', value: '—', trend: 'Loading...', color: '#ff4d6d' },
    { label: 'Pending', value: '—', trend: 'Loading...', color: '#ffc832' },
  ]

  useEffect(() => {
    if (!urgencies.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = 220
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)
    const max = Math.max(...urgencies.map(u => u.count), 1)
    ctx.clearRect(0, 0, W, H)
    const barW = 50
    const gap = (W - urgencies.length * barW) / (urgencies.length + 1)
    urgencies.forEach((u, i) => {
      const x = gap + i * (barW + gap)
      const barH = Math.max((u.count / max) * 160, 4)
      const y = 175 - barH
      ctx.fillStyle = u.color
      ctx.shadowColor = u.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 8)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(u.label, x + barW / 2, 198)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = '600 12px Inter, sans-serif'
      ctx.fillText(u.count, x + barW / 2, y - 8)
    })
  }, [urgencies])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Support Overview 📊</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Real-time insights into complaint resolution, escalation trends, and sentiment analysis.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px',
            background: data ? 'rgba(50,200,130,0.15)' : 'rgba(255,200,50,0.15)',
            color: data ? '#32c882' : '#ffc832',
            border: `1px solid ${data ? 'rgba(50,200,130,0.3)' : 'rgba(255,200,50,0.3)'}`
          }}>
            {data ? '🟢 Live Data' : '🟡 Loading...'}
          </span>
          <button onClick={fetchAnalytics} style={{
            fontSize: '11px', padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)',
            color: '#7c5cff', cursor: 'pointer', fontWeight: 600
          }}>↻ Refresh</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px',
            transition: 'all 0.25s ease', boxShadow: `0 0 25px ${s.color}15`
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Urgency bar chart */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        padding: '24px', marginBottom: '20px',
        boxShadow: '0 0 25px rgba(124,92,255,0.08)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Complaints by Urgency</h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Distribution of urgency levels across all tickets</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px 0' }}>Loading chart...</div>
        ) : urgencies.length > 0 ? (
          <canvas ref={canvasRef} style={{ width: '100%', height: '220px' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px 0' }}>No data yet — start chatting!</div>
        )}
      </div>

      {/* Sentiment breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        padding: '24px', boxShadow: '0 0 25px rgba(124,92,255,0.08)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Sentiment Breakdown</h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Customer emotion analysis across all tickets</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '20px 0' }}>Loading...</div>
        ) : sentiments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sentiments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', width: '90px', fontWeight: 500 }}>{s.label}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${totalSentiment ? (s.count / totalSentiment) * 100 : 0}%`,
                    height: '8px', borderRadius: '999px',
                    background: s.color, boxShadow: `0 0 10px ${s.color}`,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: s.color, width: '30px', textAlign: 'right' }}>{s.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '20px 0' }}>No sentiment data yet!</div>
        )}
      </div>

    </div>
  )
}