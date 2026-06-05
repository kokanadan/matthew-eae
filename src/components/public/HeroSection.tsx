'use client'

import { useEffect, useRef } from 'react'
import SkillBars from './SkillBar'
import type { Profile, Skill } from '@/types'

const PLACEHOLDER_PROFILE: Profile = {
  id: '', name: 'Your Name', course_applied: 'Course You Are Applying For',
  introduction: 'A passionate and driven individual with a love for learning, problem-solving, and making a meaningful impact. Ready to bring fresh ideas and dedication to every challenge.',
  hobbies: ['Reading', 'Coding', 'Photography', 'Music'],
  personality_traits: ['Curious', 'Resilient', 'Collaborative', 'Creative'],
  personal_quote: '"The only way to do great work is to love what you do."',
  profile_photo_url: null, updated_at: '',
}

const PLACEHOLDER_SKILLS: Skill[] = [
  { id: '1', profile_id: '', name: 'Leadership',     score: 85, description: 'Guiding teams toward shared goals', display_order: 1 },
  { id: '2', profile_id: '', name: 'Communication',  score: 90, description: 'Articulating ideas clearly and persuasively', display_order: 2 },
  { id: '3', profile_id: '', name: 'Problem Solving',score: 80, description: 'Analytical approach to complex challenges', display_order: 3 },
  { id: '4', profile_id: '', name: 'Teamwork',       score: 92, description: 'Collaborative and inclusive by nature', display_order: 4 },
  { id: '5', profile_id: '', name: 'Creativity',     score: 78, description: 'Generating novel ideas and solutions', display_order: 5 },
]

export default function HeroSection({
  profile = PLACEHOLDER_PROFILE,
  skills = PLACEHOLDER_SKILLS,
}: {
  profile?: Profile
  skills?: Skill[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Parallax on mouse move
    const el = containerRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rx = (e.clientX / window.innerWidth  - 0.5) * 12
      const ry = (e.clientY / window.innerHeight - 0.5) * 8
      el.style.setProperty('--rx', `${ry}deg`)
      el.style.setProperty('--ry', `${rx}deg`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const displaySkills = skills.length > 0 ? skills : PLACEHOLDER_SKILLS
  const displayProfile = profile ?? PLACEHOLDER_PROFILE

  return (
    <section
      id="profile"
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16"
      style={{
        background: 'radial-gradient(ellipse 100% 60% at 50% -10%, rgba(0,80,200,0.18), transparent 70%)',
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 dot-grid pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Diagonal accent line */}
      <div
        className="absolute top-0 right-0 w-px h-full opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, var(--cyan-accent), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full" ref={containerRef}>
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">

          {/* ── Left: Text content ── */}
          <div style={{ animation: 'fadeUp 0.7s ease both' }}>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <span className="tag">Portfolio</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-dim)' }} />
              <span className="font-condensed text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {displayProfile.course_applied}
              </span>
            </div>

            {/* Name */}
            <h1
              className="font-display font-700 uppercase leading-[0.92] mb-6"
              style={{
                fontSize: 'clamp(3rem, 9vw, 7rem)',
                letterSpacing: '0.03em',
                background: 'linear-gradient(135deg, #d8eaff 30%, #00d0f0 70%, #2288ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {displayProfile.name}
            </h1>

            {/* Glow underline */}
            <div className="glow-rule mb-6 w-3/4" />

            {/* Introduction */}
            <p
              className="text-lg leading-relaxed mb-8 max-w-xl"
              style={{ color: 'var(--text-body)', fontWeight: 300 }}
            >
              {displayProfile.introduction}
            </p>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 mb-8">
              {displayProfile.personality_traits.map(trait => (
                <span key={trait} className="tag">{trait}</span>
              ))}
            </div>

            {/* Hobbies */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="font-condensed text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Interests /
              </span>
              {displayProfile.hobbies.map(h => (
                <span key={h} className="text-sm" style={{ color: 'var(--text-body)' }}>{h}</span>
              ))}
            </div>
          </div>

          {/* ── Right: Stat panel ── */}
          <div style={{ animation: 'fadeUp 0.7s 0.2s ease both' }}>
            {/* Avatar card */}
            <div
              className="glass-card scan-hover mb-6 p-6 text-center"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              {/* Avatar circle */}
              <div className="relative mx-auto mb-4" style={{ width: 140, height: 140 }}>
                <div
                  className="absolute inset-0 rounded-full animate-glow-pulse"
                  style={{ background: 'radial-gradient(circle, rgba(0,180,255,0.25), transparent 70%)' }}
                />
                {displayProfile.profile_photo_url ? (
                  <img
                    src={displayProfile.profile_photo_url}
                    alt={displayProfile.name}
                    className="w-full h-full rounded-full object-cover"
                    style={{ border: '2px solid var(--border-glow)', boxShadow: 'var(--glow-blue)' }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0a1a40, #112060)',
                      border: '2px solid var(--border-glow)',
                      boxShadow: 'var(--glow-blue)',
                    }}
                  >
                    <span
                      className="font-display font-700 text-4xl uppercase"
                      style={{ color: 'var(--cyan-accent)' }}
                    >
                      {displayProfile.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <p
                className="font-condensed font-600 text-sm uppercase tracking-widest mb-1"
                style={{ color: 'var(--cyan-accent)' }}
              >
                {displayProfile.course_applied}
              </p>

              {displayProfile.personal_quote && (
                <p
                  className="text-xs italic leading-relaxed mt-3 px-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {displayProfile.personal_quote}
                </p>
              )}
            </div>

            {/* Skill bars */}
            <div className="glass-card p-6">
              <h3
                className="font-condensed font-700 text-xs uppercase tracking-[0.2em] mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                — Core Skills
              </h3>
              <SkillBars skills={displaySkills} />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom diagonal cut */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'var(--bg-void)',
          clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)',
        }}
      />
    </section>
  )
}
