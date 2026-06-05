'use client'

import { useEffect, useRef } from 'react'
import { ImageGallery } from './ImageModal'
import type { Testimonial } from '@/types'
import { TESTIMONIAL_TYPES } from '@/lib/utils'

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    ref.current.querySelectorAll('.fade-in-ready').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="testimonials"
      className="relative py-24 px-6"
      style={{ background: 'linear-gradient(180deg, var(--bg-void), var(--bg-deep) 50%, var(--bg-void))' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(0,80,180,0.08), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <span className="tag mb-3 inline-block">04</span>
          <h2 className="section-heading">Testimonials</h2>
          <p className="mt-4 max-w-xl" style={{ color: 'var(--text-body)', fontWeight: 300 }}>
            Words from teachers, mentors, and peers who have seen me in action.
          </p>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="glass-card fade-in-ready relative"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Quote mark decoration */}
              <div
                className="absolute top-4 right-5 font-display font-700 text-6xl leading-none pointer-events-none select-none"
                style={{ color: 'rgba(0, 160, 220, 0.1)' }}
              >
                "
              </div>

              <div className="p-6">
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="tag">
                    {TESTIMONIAL_TYPES[t.type] ?? t.type}
                  </span>
                  {t.year && (
                    <span className="font-condensed text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.year}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-700 text-lg mb-3">{t.title}</h3>

                {t.comment && (
                  <blockquote
                    className="text-sm leading-relaxed italic mb-4 border-l-2 pl-4"
                    style={{
                      color: 'var(--text-body)',
                      borderColor: 'var(--border-glow)',
                      fontStyle: 'italic',
                    }}
                  >
                    {t.comment}
                  </blockquote>
                )}

                {t.source && (
                  <p
                    className="font-condensed font-600 text-sm uppercase tracking-wider"
                    style={{ color: 'var(--cyan-accent)' }}
                  >
                    — {t.source}
                  </p>
                )}

                {t.media && <ImageGallery items={[t.media]} />}
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No testimonials published yet.
          </p>
        )}
      </div>
    </section>
  )
}
