'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/admin/ImageUpload'
import { formatDate } from '@/lib/utils'
import type { Project, MediaItem, FormMode } from '@/types'

type Draft = Omit<Project, 'id' | 'updated_at'> & { id?: string }
const EMPTY: Draft = { title: '', project_type: '', period: '', description: '', my_role: '', skills_used: [], what_i_learned: '', photos: [], link: null, display_order: 0, published: false }

export default function AdminProjectsPage() {
  const [items,   setItems]   = useState<Project[]>([])
  const [mode,    setMode]    = useState<FormMode>('list')
  const [draft,   setDraft]   = useState<Draft>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(true)
  const [drag,    setDrag]    = useState<string | null>(null)

  const sb = createClient()

  async function load() {
    const { data } = await sb.from('projects').select('*').order('display_order')
    setItems((data as Project[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!draft.title.trim()) { setMsg('Title is required'); return }
    setSaving(true); setMsg('')
    const payload = { title: draft.title, project_type: draft.project_type, period: draft.period, description: draft.description, my_role: draft.my_role, skills_used: draft.skills_used, what_i_learned: draft.what_i_learned, photos: draft.photos, link: draft.link || null, display_order: draft.display_order, published: draft.published }
    if (mode === 'edit' && draft.id) await sb.from('projects').update(payload).eq('id', draft.id)
    else await sb.from('projects').insert(payload)
    setMsg('Saved ✓'); setSaving(false); setMode('list'); load()
    setTimeout(() => setMsg(''), 3000)
  }

  async function del(id: string) {
    if (!confirm('Delete this project?')) return
    await sb.from('projects').delete().eq('id', id); load()
  }

  async function togglePublish(item: Project) {
    await sb.from('projects').update({ published: !item.published }).eq('id', item.id); load()
  }

  async function onDrop(targetId: string) {
    if (!drag || drag === targetId) return
    const arr = [...items]
    arr.splice(arr.findIndex(i => i.id === targetId), 0, arr.splice(arr.findIndex(i => i.id === drag), 1)[0])
    const updated = arr.map((it, idx) => ({ ...it, display_order: idx }))
    setItems(updated)
    await Promise.all(updated.map(it => sb.from('projects').update({ display_order: it.display_order }).eq('id', it.id)))
    setDrag(null)
  }

  function addPhoto() { setDraft(p => ({ ...p, photos: [...p.photos, { url: '', caption: '' }] })) }
  function updatePhoto(i: number, field: keyof MediaItem, val: string) {
    const photos = [...draft.photos]; photos[i] = { ...photos[i], [field]: val }
    setDraft(p => ({ ...p, photos }))
  }

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>

  if (mode !== 'list') return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('list')} className="text-blue-600 text-sm hover:underline">← Back</button>
        <h1 className="text-xl font-bold text-slate-800">{mode === 'new' ? 'New Project' : 'Edit Project'}</h1>
      </div>
      {msg && <div className={C(msg)}>{msg}</div>}
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <F label="Project Title" required>
            <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} className={I} />
          </F>
          <F label="Project Type">
            <input value={draft.project_type} onChange={e => setDraft(p => ({ ...p, project_type: e.target.value }))} className={I} placeholder="e.g. Mobile App, Research" />
          </F>
          <F label="Period">
            <input value={draft.period} onChange={e => setDraft(p => ({ ...p, period: e.target.value }))} className={I} placeholder="2023 – 2024" />
          </F>
          <F label="Link (optional)">
            <input value={draft.link ?? ''} onChange={e => setDraft(p => ({ ...p, link: e.target.value }))} className={I} placeholder="https://github.com/..." />
          </F>
        </div>
        <F label="Short Description" required>
          <textarea value={draft.description} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} className={I} rows={3} />
        </F>
        <F label="My Role">
          <input value={draft.my_role} onChange={e => setDraft(p => ({ ...p, my_role: e.target.value }))} className={I} />
        </F>
        <F label="Skills Used" hint="comma-separated">
          <input value={draft.skills_used.join(', ')} onChange={e => setDraft(p => ({ ...p, skills_used: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className={I} />
        </F>
        <F label="What I Learned">
          <textarea value={draft.what_i_learned} onChange={e => setDraft(p => ({ ...p, what_i_learned: e.target.value }))} className={I} rows={3} />
        </F>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">Project Images</label>
            <button type="button" onClick={addPhoto} className="text-blue-600 text-xs font-semibold hover:underline">+ Add Image</button>
          </div>
          {draft.photos.map((ph, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg mb-3 space-y-2">
              <ImageUpload value={ph.url} onChange={url => updatePhoto(i, 'url', url)} label="Image" />
              <input value={ph.caption} onChange={e => updatePhoto(i, 'caption', e.target.value)} className={I} placeholder="Caption" />
              <button onClick={() => setDraft(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))} className="text-red-400 text-xs hover:underline">Remove</button>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={draft.published} onChange={e => setDraft(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
          <span className="text-sm font-medium text-slate-700">Published</span>
        </label>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={() => setMode('list')} className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personal Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} total</p>
        </div>
        <button onClick={() => { setDraft({ ...EMPTY, display_order: items.length }); setMode('new') }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg">+ New Project</button>
      </div>
      {msg && <div className={C(msg)}>{msg}</div>}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['⠿','Title','Type','Updated','Status','Actions'].map(h => <th key={h} className="py-3 px-4 text-slate-500 text-xs uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50"
                draggable onDragStart={() => setDrag(item.id)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(item.id)}
                style={{ opacity: drag === item.id ? 0.5 : 1, cursor: 'grab' }}>
                <td className="py-3 px-4 text-slate-300">⠿</td>
                <td className="py-3 px-4 font-medium text-slate-800">{item.title}</td>
                <td className="py-3 px-4 text-slate-500 text-xs">{item.project_type}</td>
                <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(item.updated_at)}</td>
                <td className="py-3 px-4">
                  <button onClick={() => togglePublish(item)} className={`px-2 py-0.5 rounded text-xs font-semibold ${item.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.published ? 'Published' : 'Draft'}</button>
                </td>
                <td className="py-3 px-4"><div className="flex gap-2">
                  <button onClick={() => { setDraft({ ...item }); setMode('edit') }} className="text-blue-600 text-xs hover:underline">Edit</button>
                  <button onClick={() => del(item.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const I = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
function F({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return <div><label className="block text-sm font-semibold text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}{hint && <span className="text-slate-400 font-normal ml-1 text-xs">({hint})</span>}</label>{children}</div>
}
function C(m: string) {
  return `mb-4 px-4 py-2 rounded-lg text-sm ${m.includes('Error') || m.includes('required') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`
}
