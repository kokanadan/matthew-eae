'use client'

import { useEffect, useRef } from 'react'
import { ImageGallery } from './ImageModal'
import type { Achievement } from '@/types'
import { ACHIEVEMENT_CATEGORIES } from '@/lib/utils'

const CAT_ICONS: Record<string, string> = {
  academic: '🎓', competition: '🏆', cca: '⭐',
  personal: '🌟', certificate: '📜',
}

const CAT_COLORS: Record<string, string> = {
  academic: '#2288ff', competition: '#ffaa20',
  cca: '#00c8d8', personal: '#c060ff', certificate: '#40d090',
}

export default function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    ref.current.querySelectorAll('.fade-in-ready').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="achievements"
      className="relative py-24 px-6"
    >
      {/* Diagonal top cut */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'var(--bg-void)',
          clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <span className="tag mb-3 inline-block">03</span>
          <h2 className="section-heading">Achievements</h2>
          <p className="mt-4 max-w-xl" style={{ color: 'var(--text-body)', fontWeight: 300 }}>
            Recognition, milestones, and moments that reflect dedication and growth.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((ach, i) => (
            <div
              key={ach.id}
              className="glass-card fade-in-ready group"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Top accent */}
              <div
                className="h-0.5"
                style={{
                  background: CAT_COLORS[ach.category] ?? 'var(--blue-core)',
                  boxShadow: `0 0 12px ${CAT_COLORS[ach.category] ?? 'var(--blue-core)'}88`,
                }}
              />

              <div className="p-5">
                {/* Icon + year */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl" aria-hidden>
                    {CAT_ICONS[ach.category] ?? '🏅'}
                  </span>
                  <span
                    className="font-condensed font-700 text-xs uppercase tracking-widest"
                    style={{ color: CAT_COLORS[ach.category] ?? 'var(--cyan-accent)' }}
                  >
                    {ach.year}
                  </span>
                </div>

                {/* Category */}
                <span
                  className="font-condensed text-xs uppercase tracking-widest mb-1 block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {ACHIEVEMENT_CATEGORIES[ach.category] ?? ach.category}
                </span>

                {/* Title */}
                <h3 className="font-display font-700 text-lg leading-tight mb-2">
                  {ach.title}
                </h3>

                {/* Explanation */}
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-body)' }}>
                  {ach.explanation}
                </p>

                {/* Reflection */}
                {ach.reflection && (
                  <div
                    className="text-xs leading-relaxed italic border-l-2 pl-3 mt-3"
                    style={{
                      borderColor: CAT_COLORS[ach.category] ?? 'var(--border-glow)',
                      color: 'var(--text-body)',
                    }}
                  >
                    {ach.reflection}
                  </div>
                )}

                {/* Photo */}
                {ach.photo && <ImageGallery items={[ach.photo]} />}
              </div>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No achievements published yet.
          </p>
        )}
      </div>
    </section>
  )
}
