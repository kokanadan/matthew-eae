// ── Profile ──────────────────────────────────────────────────────────
export interface Profile {
  id: string
  name: string
  course_applied: string
  introduction: string
  hobbies: string[]
  personality_traits: string[]
  personal_quote: string
  profile_photo_url: string | null
  updated_at: string
}

export interface Skill {
  id: string
  profile_id: string
  name: string
  score: number        // 1–100
  description: string
  display_order: number
}

// ── Experiences ───────────────────────────────────────────────────────
export type ExperienceCategory = 'school' | 'cca' | 'leadership' | 'volunteering' | 'external'

export interface Experience {
  id: string
  title: string
  role: string
  category: ExperienceCategory
  period: string
  description: string
  skills_demonstrated: string[]
  photos: MediaItem[]
  display_order: number
  published: boolean
  updated_at: string
}

// ── Achievements ──────────────────────────────────────────────────────
export type AchievementCategory = 'academic' | 'competition' | 'cca' | 'personal' | 'certificate'

export interface Achievement {
  id: string
  title: string
  category: AchievementCategory
  year: string
  explanation: string
  reflection: string
  photo: MediaItem | null
  display_order: number
  published: boolean
  updated_at: string
}

// ── Testimonials ──────────────────────────────────────────────────────
export type TestimonialType = 'teacher_comment' | 'testimonial' | 'nyaa' | 'character_ref' | 'document' | 'other'

export interface Testimonial {
  id: string
  title: string
  type: TestimonialType
  comment: string
  source: string
  year: string
  media: MediaItem | null
  display_order: number
  published: boolean
  updated_at: string
}

// ── Projects ──────────────────────────────────────────────────────────
export interface Project {
  id: string
  title: string
  project_type: string
  period: string
  description: string
  my_role: string
  skills_used: string[]
  what_i_learned: string
  photos: MediaItem[]
  link: string | null
  display_order: number
  published: boolean
  updated_at: string
}

// ── Write-up ──────────────────────────────────────────────────────────
export interface Writeup {
  id: string
  main_title: string
  reflection: string
  why_interested: string
  motivation: string
  growth: string
  challenges: string
  contribution: string
  future_goals: string
  highlight_quote: string
  photo: MediaItem | null
  updated_at: string
}

// ── Shared ────────────────────────────────────────────────────────────
export interface MediaItem {
  url: string
  caption: string
}

// ── Admin form state ──────────────────────────────────────────────────
export type FormMode = 'list' | 'new' | 'edit'
