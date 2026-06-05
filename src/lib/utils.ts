import { createClient } from '@supabase/supabase-js'

/** Admin client using service role — server-side only */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/** Upload a file to Supabase Storage and return its public URL */
export async function uploadFile(file: File, folder = 'uploads'): Promise<string | null> {
  const supabase = createAdminClient()
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'portfolio-media'
  const ext = file.name.split('.').pop()
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: false })
  if (error) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

/** Format a date string for display */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Convert array-like textarea string (newline or comma separated) to string[] */
export function parseListField(raw: string): string[] {
  return raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
}

/** Category display labels */
export const EXPERIENCE_CATEGORIES: Record<string, string> = {
  school: 'School', cca: 'CCA', leadership: 'Leadership',
  volunteering: 'Volunteering', external: 'External',
}
export const ACHIEVEMENT_CATEGORIES: Record<string, string> = {
  academic: 'Academic', competition: 'Competition', cca: 'CCA',
  personal: 'Personal Milestone', certificate: 'Certificate',
}
export const TESTIMONIAL_TYPES: Record<string, string> = {
  teacher_comment: 'Teacher Comment', testimonial: 'Testimonial',
  nyaa: 'NYAA', character_ref: 'Character Reference',
  document: 'Document', other: 'Other',
}
