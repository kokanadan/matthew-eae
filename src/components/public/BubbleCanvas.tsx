'use client'

import { useEffect, useRef } from 'react'

interface Bubble {
  x: number; y: number; r: number; speed: number; opacity: number
  drift: number; phase: number
}

export default function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let W = 0, H = 0
    const bubbles: Bubble[] = []

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = document.body.scrollHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn initial bubbles spread across full height
    for (let i = 0; i < 55; i++) {
      bubbles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 6 + 1.5,
        speed: Math.random() * 0.5 + 0.25,
        opacity: Math.random() * 0.35 + 0.08,
        drift: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      for (const b of bubbles) {
        b.y -= b.speed
        b.x += Math.sin(b.phase + frame * 0.01) * b.drift
        b.phase += 0.005

        if (b.y < -20) {
          b.y = H + 20
          b.x = Math.random() * W
        }

        // Draw bubble
        const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r)
        grad.addColorStop(0, `rgba(180, 230, 255, ${b.opacity * 0.9})`)
        grad.addColorStop(0.6, `rgba(50, 160, 255, ${b.opacity * 0.5})`)
        grad.addColorStop(1, `rgba(0, 80, 200, ${b.opacity * 0.1})`)

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Rim highlight
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(120, 200, 255, ${b.opacity * 0.7})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
