'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/admin/ImageUpload'
import type { Writeup } from '@/types'

type Draft = Omit<Writeup, 'id' | 'updated_at'> & { id?: string }

const EMPTY: Draft = {
  main_title: 'My Personal Statement',
  reflection: '', why_interested: '', motivation: '',
  growth: '', challenges: '', contribution: '', future_goals: '',
  highlight_quote: '', photo: null,
}

const FIELDS: { key: keyof Draft; label: string; rows: number; placeholder: string }[] = [
  { key: 'reflection',     label: 'Personal Reflection (Opening)',  rows: 4, placeholder: 'A broad reflection on your journey and who you are…' },
  { key: 'why_interested', label: 'Why This Course / Institution',  rows: 4, placeholder: 'Why are you interested in this course or program?…' },
  { key: 'motivation',     label: 'What Motivates You',             rows: 3, placeholder: 'What drives and inspires you each day?…' },
  { key: 'growth',         label: 'How You Have Grown',             rows: 4, placeholder: 'Describe your personal or academic growth…' },
  { key: 'challenges',     label: 'Challenges You Have Overcome',   rows: 3, placeholder: 'Share a challenge you faced and how you overcame it…' },
  { key: 'contribution',   label: 'What You Will Contribute',       rows: 3, placeholder: 'How will you contribute to the program and community?…' },
  { key: 'future_goals',   label: 'Future Goals',                   rows: 3, placeholder: 'Where do you see yourself in 5 years?…' },
]

export default function AdminWriteupPage() {
  const [draft,   setDraft]   = useState<Draft>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(true)

  const sb = createClient()

  useEffect(() => {
    ;(async () => {
      const { data } = await sb.from('writeup').select('*').limit(1).single()
      if (data) setDraft(data as Draft)
      setLoading(false)
    })()
  }, [])

  function set(key: keyof Draft, val: any) {
    setDraft(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true); setMsg('')
    const payload = {
      main_title:     draft.main_title,
      reflection:     draft.reflection,
      why_interested: draft.why_interested,
      motivation:     draft.motivation,
      growth:         draft.growth,
      challenges:     draft.challenges,
      contribution:   draft.contribution,
      future_goals:   draft.future_goals,
      highlight_quote:draft.highlight_quote,
      photo:          draft.photo,
    }

    let error
    if (draft.id) {
      ;({ error } = await sb.from('writeup').update(payload).eq('id', draft.id))
    } else {
      ;({ error } = await sb.from('writeup').insert(payload))
    }

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Saved ✓')
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personal Write-up</h1>
          <p className="text-slate-500 text-sm mt-1">Your personal statement and reflections</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-2.5 rounded-lg text-sm ${
          msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {msg}
        </div>
      )}

      {/* ── Page Title ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Section Heading
        </label>
        <input
          value={draft.main_title}
          onChange={e => set('main_title', e.target.value)}
          className={I}
          placeholder="My Personal Statement"
        />
        <p className="text-xs text-slate-400 mt-1">This appears as the large title of the write-up section.</p>
      </div>

      {/* ── Highlight Quote ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Highlight Quote
        </label>
        <input
          value={draft.highlight_quote}
          onChange={e => set('highlight_quote', e.target.value)}
          className={I}
          placeholder={'"Your most powerful quote goes here"'}
        />
        <p className="text-xs text-slate-400 mt-1">Displayed prominently as a pull-quote in the centre of the page.</p>
      </div>

      {/* ── Text sections ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5 space-y-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
          Write-up Sections
        </h2>
        <p className="text-xs text-slate-400">
          Fill in the sections that are relevant to you. Blank sections are hidden on the public site.
        </p>

        {FIELDS.map(({ key, label, rows, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            <textarea
              value={(draft[key] as string) ?? ''}
              onChange={e => set(key, e.target.value)}
              className={I}
              rows={rows}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      {/* ── Supporting Photo ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-5">
          Supporting Photo
        </h2>
        <ImageUpload
          value={draft.photo?.url ?? ''}
          onChange={url => set('photo', url ? { url, caption: draft.photo?.caption ?? '' } : null)}
          label="Supporting Photo or Document"
        />
        {draft.photo?.url && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Photo Caption</label>
            <input
              value={draft.photo.caption}
              onChange={e => set('photo', { url: draft.photo!.url, caption: e.target.value })}
              className={I}
              placeholder="Caption for the photo (optional)"
            />
          </div>
        )}
      </div>

      {/* ── Preview note ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Preview:</strong> The write-up section is always visible on the public site (not publish/draft gated). Save your changes and visit the public site to preview.
      </div>

      {/* Bottom save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

const I = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-y'
