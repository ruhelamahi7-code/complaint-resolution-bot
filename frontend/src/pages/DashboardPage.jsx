import { useEffect, useRef, useState } from 'react'

export default function DashboardPage() {
  const canvasRef = useRef(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(() => console.error('Could not load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const urgencyColors = { Low: '#32c882', Medium: '#ffc832', High: '#ff8232', Critical: '#ff3232' }
  const sentimentColors = { Angry: '#ff4d6d', Frustrated: '#ffa032', Calm: '#32c882', Neutral: '#aaaaaa' }

  const stats = analytics ? [
    { label: 'Total Complaints', value: String(analytics.total), trend: '↗ All time', color: '#7c5cff' },
    { label: 'Auto Resolved', value: String(analytics.resolved), trend: `✓ ${analytics.resolutionRate}% resolution rate`, color: '#32c882' },
    { label: 'Escalated', value: String(analytics.escalated), trend: '⚠ Needs review', color: '#ff4d6d' },
    { label: 'Pending', value: String(analytics.pending), trend: '⏳ In queue', color: '#ffc832' },
  ] : []

  const urgencyBars = analytics ? Object.entries(analytics.urgencyCounts).map(([label, count]) => ({
    label, count, color: urgencyColors[label] || '#aaaaaa'
  })) : []

  const sentiments = analytics ? Object.entries(analytics.sentimentCounts).map(([label, count]) => ({
    label, count, color: sentimentColors[label] || '#aaaaaa'
  })) : []

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || urgencyBars.length === 0) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = 220
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)
    const max = Math.max(...urgencyBars.map(b => b.count), 1)
    ctx.clearRect(0, 0, W, H)
    const barW = 40
    const gap = (W - urgencyBars.length * barW) / (urgencyBars.length + 1)
    urgencyBars.forEach((cat, i) => {
      const x = gap + i * (barW + gap)
      const barH = (cat.count / max) * 160
      const y = 175 - barH
      ctx.fillStyle = cat.color
      ctx.shadowColor = cat.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(x, y, barW, Math.max(barH, 2), 8)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(cat.label, x + barW / 2, 198)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = '600 12px Inter, sans-serif'
      ctx.fillText(cat.count, x + barW / 2, y - 8)
    })
  }, [urgencyBars])

  const totalSentiment = sentiments.reduce((sum, s) => sum + s.count, 0) || 1

  if (loading) {
    return <div style={{ padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading analytics…</div>
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 28px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', color: '#ffffff' }}>
          <span style={{
            background: 'linear-gradient(90deg, #ffffff, #ff6b3d)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'
          }}>Support Overview</span> 📊
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Real-time insights into complaint resolution, escalation trends, and sentiment analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(s => (
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

      <div style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px',
        marginBottom: '20px', boxShadow: '0 0 25px rgba(124,92,255,0.08)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Complaints by Urgency</h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Live distribution across all tickets</p>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '220px' }} />
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px',
        boxShadow: '0 0 25px rgba(124,92,255,0.08)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Sentiment Breakdown</h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Customer emotion analysis across all tickets</p>
        </div>
        {sentiments.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>No sentiment data yet — chat with the bot to populate this.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sentiments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', width: '80px', fontWeight: 500 }}>{s.label}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(s.count / totalSentiment) * 100}%`, height: '8px', borderRadius: '999px',
                    background: s.color, boxShadow: `0 0 10px ${s.color}`, transition: 'width 1s ease'
                  }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: s.color, width: '30px', textAlign: 'right' }}>{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}