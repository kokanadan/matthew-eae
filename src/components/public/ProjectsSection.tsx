'use client'

import { useState, useEffect, useRef } from 'react'
import { ImageGallery } from './ImageModal'
import type { Project } from '@/types'

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
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
      id="projects"
      className="relative py-24 px-6"
    >
      {/* Diagonal top */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'var(--bg-void)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 40%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <span className="tag mb-3 inline-block">05</span>
          <h2 className="section-heading">Personal Projects</h2>
          <p className="mt-4 max-w-xl" style={{ color: 'var(--text-body)', fontWeight: 300 }}>
            Things I have built, created, or contributed to independently.
          </p>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-6">
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className="glass-card fade-in-ready scan-hover"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {/* Project type bar */}
              <div
                className="h-0.5 w-full"
                style={{
                  background: 'linear-gradient(90deg, var(--blue-core), var(--cyan-accent))',
                  boxShadow: '0 0 10px rgba(0,180,255,0.4)',
                }}
              />

              {/* Preview image (first photo) */}
              {proj.photos?.[0] && (
                <div className="overflow-hidden h-40">
                  <img
                    src={proj.photos[0].url}
                    alt={proj.photos[0].caption || proj.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                    onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}
                  />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className="font-condensed text-xs uppercase tracking-widest mb-1 block"
                      style={{ color: 'var(--cyan-accent)' }}
                    >
                      {proj.project_type}
                    </span>
                    <h3 className="font-display font-700 text-xl">{proj.title}</h3>
                  </div>
                  <span className="font-condensed text-xs shrink-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                    {proj.period}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-body)' }}>
                  {proj.description}
                </p>

                {/* Skills */}
                {proj.skills_used?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {proj.skills_used.map(s => <span key={s} className="tag text-[10px]">{s}</span>)}
                  </div>
                )}

                {/* Expandable details */}
                <button
                  className="font-condensed text-xs uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--cyan-accent)' }}
                  onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}
                >
                  {expanded === proj.id ? '↑ Less' : '↓ More Details'}
                </button>

                {expanded === proj.id && (
                  <div className="mt-4 space-y-3">
                    {proj.my_role && (
                      <div>
                        <span className="font-condensed text-xs uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>
                          My Role
                        </span>
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>{proj.my_role}</p>
                      </div>
                    )}
                    {proj.what_i_learned && (
                      <div>
                        <span className="font-condensed text-xs uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>
                          What I Learned
                        </span>
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>{proj.what_i_learned}</p>
                      </div>
                    )}
                    {proj.photos?.length > 0 && <ImageGallery items={proj.photos} />}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block font-condensed text-xs uppercase tracking-widest mt-2 transition-colors"
                        style={{ color: 'var(--cyan-bright)' }}
                      >
                        ↗ View Project
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No projects published yet.
          </p>
        )}
      </div>
    </section>
  )
}
