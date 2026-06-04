import { useEffect, useRef } from 'react'

export default function DashboardPage() {
  const canvasRef = useRef(null)

  const stats = [
    { label: 'Total Complaints', value: '128', color: 'bg-blue-50 text-blue-700' },
    { label: 'Auto Resolved', value: '94', color: 'bg-green-50 text-green-700' },
    { label: 'Escalated', value: '18', color: 'bg-red-50 text-red-700' },
    { label: 'Pending', value: '16', color: 'bg-yellow-50 text-yellow-700' },
  ]

  const categories = [
    { label: 'Delivery', count: 42, color: '#378ADD' },
    { label: 'Refund', count: 31, color: '#D85A30' },
    { label: 'Product', count: 28, color: '#1D9E75' },
    { label: 'Billing', count: 17, color: '#BA7517' },
    { label: 'Other', count: 10, color: '#7F77DD' },
  ]

  const sentiments = [
    { label: 'Angry', count: 34, color: '#E24B4A' },
    { label: 'Frustrated', count: 51, color: '#EF9F27' },
    { label: 'Calm', count: 43, color: '#1D9E75' },
  ]

 useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = 220
    
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const max = Math.max(...categories.map(b => b.count))
    ctx.clearRect(0, 0, W, H)

    const barW = 36
    const gap = (W - categories.length * barW) / (categories.length + 1)

    categories.forEach((cat, i) => {
      const x = gap + i * (barW + gap)
      const barH = (cat.count / max) * 160
      const y = 180 - barH
      ctx.fillStyle = cat.color
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 6)
      ctx.fill()
      ctx.fillStyle = '#888'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(cat.label, x + barW / 2, 200)
      ctx.fillStyle = '#333'
      ctx.font = '12px sans-serif'
      ctx.fillText(cat.count, x + barW / 2, y - 6)
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Complaints by Category</h3>
        <canvas ref={canvasRef} style={{ width: '100%', height: '220px' }} />
      </div>

      {/* Sentiment breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Sentiment Breakdown</h3>
        <div className="flex flex-col gap-3">
          {sentiments.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-20">{s.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{ width: `${(s.count / 128) * 100}%`, background: s.color }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}