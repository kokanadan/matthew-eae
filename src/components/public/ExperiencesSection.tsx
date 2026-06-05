'use client'

import { useState, useEffect, useRef } from 'react'
import { ImageGallery } from './ImageModal'
import type { Experience } from '@/types'
import { EXPERIENCE_CATEGORIES } from '@/lib/utils'

const CATS = ['all', 'school', 'cca', 'leadership', 'volunteering', 'external']

const CAT_COLORS: Record<string, string> = {
  school: '#2288ff', cca: '#00c0d8', leadership: '#a060ff',
  volunteering: '#20d060', external: '#ff8020',
}

export default function ExperiencesSection({ experiences }: { experiences: Experience[] }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = filter === 'all'
    ? experiences
    : experiences.filter(e => e.category === filter)

  useEffect(() => {
    if (!listRef.current) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.12 }
    )
    listRef.current.querySelectorAll('.fade-in-ready').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [filtered])

  return (
    <section
      id="experiences"
      className="relative py-24 px-6"
      style={{ background: 'linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 50%, var(--bg-void) 100%)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <span className="tag mb-3 inline-block">02</span>
          <h2 className="section-heading" style={{ color: 'var(--text-bright)' }}>
            Experiences
          </h2>
          <p className="mt-4 max-w-xl" style={{ color: 'var(--text-body)', fontWeight: 300 }}>
            A record of activities, roles, and contributions that have shaped who I am.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="font-condensed font-600 text-xs uppercase tracking-[0.12em] px-4 py-1.5 rounded-sm transition-all duration-200"
              style={{
                background: filter === cat ? (CAT_COLORS[cat] ?? 'var(--blue-core)') : 'transparent',
                color: filter === cat ? '#fff' : 'var(--text-body)',
                border: `1px solid ${filter === cat ? 'transparent' : 'var(--border-dim)'}`,
                boxShadow: filter === cat ? '0 0 12px rgba(0,180,255,0.4)' : 'none',
              }}
            >
              {cat === 'all' ? 'All' : EXPERIENCE_CATEGORIES[cat]}
            </button>
          ))}
        </div>

        {/* Experience cards */}
        <div ref={listRef} className="grid md:grid-cols-2 gap-5">
          {filtered.map((exp, i) => (
            <div
              key={exp.id}
              className="glass-card scan-hover fade-in-ready cursor-pointer"
              style={{ transitionDelay: `${i * 60}ms` }}
              onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
            >
              {/* Category color bar */}
              <div
                className="h-0.5 w-full rounded-t-sm"
                style={{ background: CAT_COLORS[exp.category] ?? 'var(--blue-core)', boxShadow: `0 0 10px ${CAT_COLORS[exp.category]}88` }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className="font-condensed text-xs uppercase tracking-widest mb-1 block"
                      style={{ color: CAT_COLORS[exp.category] ?? 'var(--cyan-accent)' }}
                    >
                      {EXPERIENCE_CATEGORIES[exp.category] ?? exp.category}
                    </span>
                    <h3 className="font-display font-700 text-xl leading-tight">{exp.title}</h3>
                    {exp.role && (
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-body)' }}>
                        {exp.role}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-condensed text-xs whitespace-nowrap shrink-0 mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {exp.period}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-body)' }}>
                  {exp.description}
                </p>

                {/* Skills tags */}
                {exp.skills_demonstrated?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {exp.skills_demonstrated.map(s => (
                      <span key={s} className="tag text-[10px]">{s}</span>
                    ))}
                  </div>
                )}

                {/* Expand / collapse */}
                {(exp.photos?.length > 0) && (
                  <>
                    <button
                      className="font-condensed text-xs uppercase tracking-widest mt-1 transition-colors"
                      style={{ color: 'var(--cyan-accent)' }}
                      onClick={e => { e.stopPropagation(); setExpanded(expanded === exp.id ? null : exp.id) }}
                    >
                      {expanded === exp.id ? '↑ Hide Photos' : `↓ View Photos (${exp.photos.length})`}
                    </button>

                    {expanded === exp.id && (
                      <ImageGallery items={exp.photos} />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No experiences in this category yet.
          </p>
        )}
      </div>
    </section>
  )
}
