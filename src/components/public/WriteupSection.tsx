'use client'

import { useEffect, useRef } from 'react'
import { ImageGallery } from './ImageModal'
import type { Writeup } from '@/types'

const PLACEHOLDER: Writeup = {
  id: '', main_title: 'My Personal Statement',
  reflection: 'Reflecting on my journey, I have grown from a curious student to someone who actively seeks out challenges and opportunities to learn.',
  why_interested: 'My interest in this course stems from a deep passion for understanding systems and creating solutions that make a real difference in people\'s lives.',
  motivation: 'I am motivated by the belief that knowledge and effort can move the world forward. Every day is an opportunity to be better than yesterday.',
  growth: 'Through my various experiences — from leading the Student Council to building personal projects — I have developed resilience, adaptability, and a growth mindset.',
  challenges: 'The biggest challenges I faced taught me the most. Failing initially pushed me to reflect, improve, and return stronger.',
  contribution: 'I hope to bring creativity, dedication, and a collaborative spirit to every project and team I join.',
  future_goals: 'In five years, I see myself contributing meaningfully to my field while continuing to learn and inspire others around me.',
  highlight_quote: '"Growth happens at the edge of your comfort zone."',
  photo: null, updated_at: '',
}

const SECTIONS = [
  { key: 'why_interested',  label: 'Why This Course',        icon: '◆' },
  { key: 'motivation',      label: 'What Motivates Me',      icon: '◆' },
  { key: 'growth',          label: 'How I Have Grown',       icon: '◆' },
  { key: 'challenges',      label: 'Challenges Overcome',    icon: '◆' },
  { key: 'contribution',    label: 'What I Will Contribute', icon: '◆' },
  { key: 'future_goals',    label: 'Future Goals',           icon: '◆' },
] as const

export default function WriteupSection({ writeup: w }: { writeup?: Writeup | null }) {
  const data = w ?? PLACEHOLDER
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    ref.current.querySelectorAll('.fade-in-ready').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="writeup"
      className="relative py-24 px-6"
      style={{ background: 'linear-gradient(180deg, var(--bg-void), var(--bg-deep))' }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--border-glow), transparent)' }}
      />

      <div className="max-w-4xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <span className="tag mb-4 inline-block">06</span>
          <h2
            className="font-display font-700 uppercase leading-tight"
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 4rem)',
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #d8eaff, #00d0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {data.main_title}
          </h2>
          <div className="glow-rule mt-4 mx-auto w-48" />
        </div>

        {/* Personal reflection intro */}
        {data.reflection && (
          <div className="glass-card p-8 mb-8 fade-in-ready">
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--text-bright)', fontWeight: 300 }}
            >
              {data.reflection}
            </p>
          </div>
        )}

        {/* Highlight quote */}
        {data.highlight_quote && (
          <div
            className="relative py-10 px-8 my-10 text-center fade-in-ready"
            style={{ borderTop: '1px solid var(--border-dim)', borderBottom: '1px solid var(--border-dim)' }}
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4"
              style={{ background: 'var(--bg-void)' }}
            >
              <span className="tag">Quote</span>
            </span>
            <blockquote
              className="font-display font-600 text-2xl md:text-3xl leading-tight"
              style={{
                color: 'var(--cyan-accent)',
                textShadow: '0 0 30px rgba(0,200,255,0.3)',
              }}
            >
              {data.highlight_quote}
            </blockquote>
          </div>
        )}

        {/* Writeup sections in two columns */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {SECTIONS.map(({ key, label, icon }, i) => {
            const text = data[key]
            if (!text) return null
            return (
              <div
                key={key}
                className="glass-card p-5 fade-in-ready"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: 'var(--cyan-accent)' }}>{icon}</span>
                  <h3
                    className="font-condensed font-700 text-sm uppercase tracking-[0.15em]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {label}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {text}
                </p>
              </div>
            )
          })}
        </div>

        {/* Supporting photo */}
        {data.photo && (
          <div className="fade-in-ready">
            <ImageGallery items={[data.photo]} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-20 text-center">
        <div className="glow-rule mx-auto w-32 mb-6" />
        <p className="font-condensed text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
          End of Portfolio
        </p>
      </div>
    </section>
  )
}
