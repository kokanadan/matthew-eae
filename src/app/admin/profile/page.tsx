'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/admin/ImageUpload'
import type { Profile, Skill } from '@/types'

type SkillDraft = Omit<Skill, 'profile_id'>

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [skills,  setSkills]  = useState<SkillDraft[]>([])
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const sb = createClient()
      const [{ data: p }, { data: s }] = await Promise.all([
        sb.from('profile').select('*').limit(1).single(),
        sb.from('skills').select('*').order('display_order'),
      ])
      if (p) setProfile(p)
      if (s) setSkills(s)
      setLoading(false)
    })()
  }, [])

  function updateProfile(field: keyof Profile, value: any) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  function parseArray(raw: string): string[] {
    return raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
  }

  // Skills management
  function addSkill() {
    setSkills(prev => [...prev, { id: `new-${Date.now()}`, name: '', score: 75, description: '', display_order: prev.length }])
  }
  function updateSkill(id: string, field: keyof SkillDraft, val: any) {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }
  function removeSkill(id: string) {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  async function save() {
    setSaving(true); setMsg('')
    const sb = createClient()
    // Update profile
    const { error: pe } = await sb.from('profile')
      .update({
        name:               profile.name,
        course_applied:     profile.course_applied,
        introduction:       profile.introduction,
        hobbies:            profile.hobbies,
        personality_traits: profile.personality_traits,
        personal_quote:     profile.personal_quote,
        profile_photo_url:  profile.profile_photo_url,
      })
      .eq('id', profile.id!)
    if (pe) { setMsg('Error: ' + pe.message); setSaving(false); return }

    // Sync skills — delete all, re-insert
    await sb.from('skills').delete().eq('profile_id', profile.id!)
    if (skills.length > 0) {
      const { error: se } = await sb.from('skills').insert(
        skills.map((s, i) => ({
          profile_id:    profile.id,
          name:          s.name,
          score:         Number(s.score),
          description:   s.description,
          display_order: i,
        }))
      )
      if (se) { setMsg('Error saving skills: ' + se.message); setSaving(false); return }
    }
    setMsg('Saved ✓')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Your core identity and skills</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-2 rounded-lg text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {msg}
        </div>
      )}

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 space-y-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
          Basic Information
        </h2>

        <Field label="Full Name" required>
          <input value={profile.name ?? ''} onChange={e => updateProfile('name', e.target.value)}
            className={inp} placeholder="Your full name" />
        </Field>

        <Field label="Course Applied For" required>
          <input value={profile.course_applied ?? ''} onChange={e => updateProfile('course_applied', e.target.value)}
            className={inp} placeholder="e.g. Computer Science at NUS" />
        </Field>

        <Field label="Short Introduction">
          <textarea value={profile.introduction ?? ''} onChange={e => updateProfile('introduction', e.target.value)}
            className={inp} rows={4} placeholder="Introduce yourself in 2–4 sentences" />
        </Field>

        <Field label="Personal Quote">
          <input value={profile.personal_quote ?? ''} onChange={e => updateProfile('personal_quote', e.target.value)}
            className={inp} placeholder='"Your favourite quote"' />
        </Field>
      </div>

      {/* ── Photo ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-5">
          Profile Photo
        </h2>
        <ImageUpload
          value={profile.profile_photo_url ?? ''}
          onChange={url => updateProfile('profile_photo_url', url)}
          label="Profile Photo"
        />
      </div>

      {/* ── Tags ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6 space-y-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
          Personality &amp; Interests
        </h2>

        <Field label="Hobbies / Interests" hint="Comma or newline separated">
          <textarea
            value={(profile.hobbies ?? []).join(', ')}
            onChange={e => updateProfile('hobbies', parseArray(e.target.value))}
            className={inp} rows={2} placeholder="Reading, Coding, Photography" />
        </Field>

        <Field label="Personality Traits" hint="Comma or newline separated">
          <textarea
            value={(profile.personality_traits ?? []).join(', ')}
            onChange={e => updateProfile('personality_traits', parseArray(e.target.value))}
            className={inp} rows={2} placeholder="Curious, Resilient, Creative" />
        </Field>
      </div>

      {/* ── Skills ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Skill Stat Bars</h2>
          <button onClick={addSkill}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
            + Add Skill
          </button>
        </div>

        <div className="space-y-4">
          {skills.map((skill, i) => (
            <div key={skill.id} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <Field label="Skill Name">
                  <input value={skill.name} onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                    className={inp} placeholder="Leadership" />
                </Field>
                <Field label={`Score: ${skill.score}`}>
                  <input type="range" min={1} max={100} value={skill.score}
                    onChange={e => updateSkill(skill.id, 'score', Number(e.target.value))}
                    className="w-full mt-2" />
                </Field>
                <Field label="Description">
                  <input value={skill.description} onChange={e => updateSkill(skill.id, 'description', e.target.value)}
                    className={inp} placeholder="Brief description" />
                </Field>
              </div>
              <button onClick={() => removeSkill(skill.id)}
                className="text-slate-400 hover:text-red-500 mt-6 text-lg transition-colors">×</button>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No skills yet. Click "+ Add Skill".</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────
const inp = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

function Field({ label, children, required, hint }: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-slate-400 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
