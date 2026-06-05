import { createClient } from '@/lib/supabase-server'
import BubbleCanvas from '@/components/public/BubbleCanvas'
import Navbar from '@/components/public/Navbar'
import HeroSection from '@/components/public/HeroSection'
import ExperiencesSection from '@/components/public/ExperiencesSection'
import AchievementsSection from '@/components/public/AchievementsSection'
import TestimonialsSection from '@/components/public/TestimonialsSection'
import ProjectsSection from '@/components/public/ProjectsSection'
import WriteupSection from '@/components/public/WriteupSection'
import type { Profile, Skill, Experience, Achievement, Testimonial, Project, Writeup } from '@/types'

export const revalidate = 60 // Revalidate every 60 seconds

async function fetchPortfolioData() {
  try {
    const supabase = await createClient()
    const [
      { data: profileArr },
      { data: skills },
      { data: experiences },
      { data: achievements },
      { data: testimonials },
      { data: projects },
      { data: writeupArr },
    ] = await Promise.all([
      supabase.from('profile').select('*').limit(1),
      supabase.from('skills').select('*').order('display_order'),
      supabase.from('experiences').select('*').eq('published', true).order('display_order'),
      supabase.from('achievements').select('*').eq('published', true).order('display_order'),
      supabase.from('testimonials').select('*').eq('published', true).order('display_order'),
      supabase.from('projects').select('*').eq('published', true).order('display_order'),
      supabase.from('writeup').select('*').limit(1),
    ])
    return {
      profile:      (profileArr?.[0]  ?? null) as Profile | null,
      skills:       (skills           ?? [])   as Skill[],
      experiences:  (experiences      ?? [])   as Experience[],
      achievements: (achievements     ?? [])   as Achievement[],
      testimonials: (testimonials     ?? [])   as Testimonial[],
      projects:     (projects         ?? [])   as Project[],
      writeup:      (writeupArr?.[0]  ?? null) as Writeup | null,
    }
  } catch {
    // Return empty data if Supabase isn't configured yet — placeholder UI will show
    return { profile: null, skills: [], experiences: [], achievements: [], testimonials: [], projects: [], writeup: null }
  }
}

export default async function PortfolioPage() {
  const data = await fetchPortfolioData()

  return (
    <main style={{ background: 'var(--bg-void)' }}>
      {/* Ambient background */}
      <BubbleCanvas />

      {/* Fixed grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,120,200,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,200,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <Navbar />

      <div className="relative z-10">
        <HeroSection
          profile={data.profile ?? undefined}
          skills={data.skills}
        />
        <ExperiencesSection  experiences={data.experiences} />
        <AchievementsSection achievements={data.achievements} />
        <TestimonialsSection testimonials={data.testimonials} />
        <ProjectsSection     projects={data.projects} />
        <WriteupSection      writeup={data.writeup} />
      </div>
    </main>
  )
}
