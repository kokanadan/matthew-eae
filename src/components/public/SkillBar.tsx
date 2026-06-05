'use client'

import { useEffect, useRef, useState } from 'react'
import type { Skill } from '@/types'

function SkillBar({ skill, delay = 0 }: { skill: Skill; delay?: number }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="group" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-baseline mb-1.5">
        <span
          className="font-condensed font-600 text-sm uppercase tracking-widest"
          style={{ color: 'var(--text-bright)' }}
        >
          {skill.name}
        </span>
        <span
          className="font-display font-700 text-lg tabular-nums"
          style={{ color: 'var(--cyan-accent)' }}
        >
          {skill.score}
        </span>
      </div>

      {/* Track */}
      <div
        className="relative h-1.5 rounded-full overflow-hidden mb-1"
        style={{ background: 'rgba(0,140,200,0.12)' }}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: animated ? `${skill.score}%` : '0%',
            transitionDuration: '1.1s',
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
            background: `linear-gradient(90deg, #1a6bff, #00d0f0)`,
            boxShadow: '0 0 8px rgba(0,200,255,0.5)',
          }}
        />
        {/* Shimmer on top */}
        <div
          className="absolute inset-y-0 left-0 w-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: animated ? 'shimmer 2s 1.2s ease infinite' : 'none',
          }}
        />
      </div>

      {skill.description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {skill.description}
        </p>
      )}
    </div>
  )
}

export default function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-4">
      {skills.map((skill, i) => (
        <SkillBar key={skill.id} skill={skill} delay={i * 80} />
      ))}
    </div>
  )
}
