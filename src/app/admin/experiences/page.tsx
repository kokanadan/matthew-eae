'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/admin/ImageUpload'
import { formatDate, EXPERIENCE_CATEGORIES } from '@/lib/utils'
import type { Experience, MediaItem, FormMode } from '@/types'

type Draft = Omit<Experience, 'id' | 'updated_at'> & { id?: string }

const EMPTY: Draft = {
  title: '', role: '', category: 'school', period: '', description: '',
  skills_demonstrated: [], photos: [], display_order: 0, published: false,
}

export default function AdminExperiencesPage() {
  const [items,   setItems]   = useState<Experience[]>([])
  const [mode,    setMode]    = useState<FormMode>('list')
  const [draft,   setDraft]   = useState<Draft>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(true)
  const [drag,    setDrag]    = useState<string | null>(null)

  const sb = createClient()

  async function load() {
    const { data } = await sb.from('experiences').select('*').order('display_order')
    setItems((data as Experience[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function edit(item: Experience) { setDraft({ ...item }); setMode('edit') }
  function newItem() { setDraft({ ...EMPTY, display_order: items.length }); setMode('new') }

  async function save() {
    if (!draft.title.trim()) { setMsg('Title is required'); return }
    setSaving(true); setMsg('')
    const payload = {
      title: draft.title, role: draft.role, category: draft.category,
      period: draft.period, description: draft.description,
      skills_demonstrated: draft.skills_demonstrated,
      photos: draft.photos, display_order: draft.display_order,
      published: draft.published,
    }
    if (mode === 'edit' && draft.id) {
      await sb.from('experiences').update(payload).eq('id', draft.id)
    } else {
      await sb.from('experiences').insert(payload)
    }
    setMsg('Saved ✓'); setSaving(false); setMode('list'); load()
    setTimeout(() => setMsg(''), 3000)
  }

  async function del(id: string) {
    if (!confirm('Delete this experience?')) return
    await sb.from('experiences').delete().eq('id', id)
    load()
  }

  async function togglePublish(item: Experience) {
    await sb.from('experiences').update({ published: !item.published }).eq('id', item.id)
    load()
  }

  // Drag-and-drop reorder
  async function onDrop(targetId: string) {
    if (!drag || drag === targetId) return
    const arr = [...items]
    const from = arr.findIndex(i => i.id === drag)
    const to   = arr.findIndex(i => i.id === targetId)
    arr.splice(to, 0, arr.splice(from, 1)[0])
    const updated = arr.map((it, idx) => ({ ...it, display_order: idx }))
    setItems(updated)
    await Promise.all(updated.map(it => sb.from('experiences').update({ display_order: it.display_order }).eq('id', it.id)))
    setDrag(null)
  }

  // Photo helpers
  function addPhoto() {
    setDraft(prev => ({ ...prev, photos: [...prev.photos, { url: '', caption: '' }] }))
  }
  function updatePhoto(i: number, field: keyof MediaItem, val: string) {
    const photos = [...draft.photos]
    photos[i] = { ...photos[i], [field]: val }
    setDraft(prev => ({ ...prev, photos }))
  }
  function removePhoto(i: number) {
    setDraft(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))
  }

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>

  // ── Form view ──
  if (mode !== 'list') return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('list')} className="text-blue-600 text-sm hover:underline">← Back</button>
        <h1 className="text-xl font-bold text-slate-800">{mode === 'new' ? 'New Experience' : 'Edit Experience'}</h1>
      </div>

      {msg && <div className={msgClass(msg)}>{msg}</div>}

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <F label="Title" required>
            <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} className={I} />
          </F>
          <F label="Role">
            <input value={draft.role} onChange={e => setDraft(p => ({ ...p, role: e.target.value }))} className={I} />
          </F>
          <F label="Category">
            <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as any }))} className={I}>
              {Object.entries(EXPERIENCE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </F>
          <F label="Period">
            <input value={draft.period} onChange={e => setDraft(p => ({ ...p, period: e.target.value }))} className={I} placeholder="2023 – 2024" />
          </F>
        </div>

        <F label="Description">
          <textarea value={draft.description} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} className={I} rows={4} />
        </F>

        <F label="Skills Demonstrated" hint="comma-separated">
          <input value={draft.skills_demonstrated.join(', ')}
            onChange={e => setDraft(p => ({ ...p, skills_demonstrated: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            className={I} placeholder="Leadership, Communication" />
        </F>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">Photos</label>
            <button type="button" onClick={addPhoto} className="text-blue-600 text-xs font-semibold hover:underline">+ Add Photo</button>
          </div>
          {draft.photos.map((ph, i) => (
            <div key={i} className="flex gap-3 items-end mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 space-y-2">
                <ImageUpload value={ph.url} onChange={url => updatePhoto(i, 'url', url)} label="Photo" />
                <input value={ph.caption} onChange={e => updatePhoto(i, 'caption', e.target.value)}
                  className={I} placeholder="Caption (optional)" />
              </div>
              <button onClick={() => removePhoto(i)} className="text-slate-400 hover:text-red-500 pb-2 text-xl">×</button>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={draft.published}
              onChange={e => setDraft(p => ({ ...p, published: e.target.checked }))}
              className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-medium text-slate-700">Published (visible on public site)</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setMode('list')} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  // ── List view ──
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Experiences</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} total · Drag rows to reorder</p>
        </div>
        <button onClick={newItem}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          + New Experience
        </button>
      </div>

      {msg && <div className={msgClass(msg)}>{msg}</div>}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-8">⠿</th>
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Title</th>
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Updated</th>
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                draggable
                onDragStart={() => setDrag(item.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(item.id)}
                style={{ opacity: drag === item.id ? 0.5 : 1, cursor: 'grab' }}
              >
                <td className="py-3 px-4 text-slate-300">⠿</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-800">{item.title}</div>
                  {item.role && <div className="text-slate-400 text-xs">{item.role}</div>}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {EXPERIENCE_CATEGORIES[item.category] ?? item.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 hidden lg:table-cell text-xs">{formatDate(item.updated_at)}</td>
                <td className="py-3 px-4">
                  <button onClick={() => togglePublish(item)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${item.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => edit(item)} className="text-blue-600 text-xs hover:underline">Edit</button>
                    <button onClick={() => del(item.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-slate-400">No experiences yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const I = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
function F({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
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
function msgClass(m: string) {
  return `mb-4 px-4 py-2 rounded-lg text-sm ${m.includes('Error') || m.includes('required') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`
}
