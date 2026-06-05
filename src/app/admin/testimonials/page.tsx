'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/admin/ImageUpload'
import { formatDate, TESTIMONIAL_TYPES } from '@/lib/utils'
import type { Testimonial, FormMode } from '@/types'

type Draft = Omit<Testimonial, 'id' | 'updated_at'> & { id?: string }
const EMPTY: Draft = { title: '', type: 'testimonial', comment: '', source: '', year: '', media: null, display_order: 0, published: false }

export default function AdminTestimonialsPage() {
  const [items,   setItems]   = useState<Testimonial[]>([])
  const [mode,    setMode]    = useState<FormMode>('list')
  const [draft,   setDraft]   = useState<Draft>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(true)
  const [drag,    setDrag]    = useState<string | null>(null)

  const sb = createClient()

  async function load() {
    const { data } = await sb.from('testimonials').select('*').order('display_order')
    setItems((data as Testimonial[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!draft.title.trim()) { setMsg('Title is required'); return }
    setSaving(true); setMsg('')
    const payload = { title: draft.title, type: draft.type, comment: draft.comment, source: draft.source, year: draft.year, media: draft.media, display_order: draft.display_order, published: draft.published }
    if (mode === 'edit' && draft.id) await sb.from('testimonials').update(payload).eq('id', draft.id)
    else await sb.from('testimonials').insert(payload)
    setMsg('Saved ✓'); setSaving(false); setMode('list'); load()
    setTimeout(() => setMsg(''), 3000)
  }

  async function del(id: string) {
    if (!confirm('Delete this?')) return
    await sb.from('testimonials').delete().eq('id', id); load()
  }

  async function togglePublish(item: Testimonial) {
    await sb.from('testimonials').update({ published: !item.published }).eq('id', item.id); load()
  }

  async function onDrop(targetId: string) {
    if (!drag || drag === targetId) return
    const arr = [...items]
    arr.splice(arr.findIndex(i => i.id === targetId), 0, arr.splice(arr.findIndex(i => i.id === drag), 1)[0])
    const updated = arr.map((it, idx) => ({ ...it, display_order: idx }))
    setItems(updated)
    await Promise.all(updated.map(it => sb.from('testimonials').update({ display_order: it.display_order }).eq('id', it.id)))
    setDrag(null)
  }

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>

  if (mode !== 'list') return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('list')} className="text-blue-600 text-sm hover:underline">← Back</button>
        <h1 className="text-xl font-bold text-slate-800">{mode === 'new' ? 'New Testimonial' : 'Edit Testimonial'}</h1>
      </div>
      {msg && <div className={C(msg)}>{msg}</div>}
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <F label="Title" required>
            <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} className={I} />
          </F>
          <F label="Type">
            <select value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value as any }))} className={I}>
              {Object.entries(TESTIMONIAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </F>
          <F label="Source">
            <input value={draft.source} onChange={e => setDraft(p => ({ ...p, source: e.target.value }))} className={I} placeholder="Ms Chen, Form Teacher" />
          </F>
          <F label="Year">
            <input value={draft.year} onChange={e => setDraft(p => ({ ...p, year: e.target.value }))} className={I} placeholder="2024" />
          </F>
        </div>
        <F label="Comment / Description">
          <textarea value={draft.comment} onChange={e => setDraft(p => ({ ...p, comment: e.target.value }))} className={I} rows={5} />
        </F>
        <ImageUpload
          value={draft.media?.url ?? ''}
          onChange={url => setDraft(p => ({ ...p, media: url ? { url, caption: p.media?.caption ?? '' } : null }))}
          label="Supporting Document / Image"
        />
        {draft.media && (
          <F label="Media Caption">
            <input value={draft.media.caption} onChange={e => setDraft(p => ({ ...p, media: { url: p.media!.url, caption: e.target.value } }))} className={I} />
          </F>
        )}
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
          <h1 className="text-2xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} total</p>
        </div>
        <button onClick={() => { setDraft({ ...EMPTY, display_order: items.length }); setMode('new') }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg">+ New Testimonial</button>
      </div>
      {msg && <div className={C(msg)}>{msg}</div>}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['⠿','Title','Type','Source','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-slate-500 text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50"
                draggable onDragStart={() => setDrag(item.id)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(item.id)}
                style={{ opacity: drag === item.id ? 0.5 : 1, cursor: 'grab' }}>
                <td className="py-3 px-4 text-slate-300">⠿</td>
                <td className="py-3 px-4 font-medium text-slate-800">{item.title}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{TESTIMONIAL_TYPES[item.type] ?? item.type}</span></td>
                <td className="py-3 px-4 text-slate-500 text-xs">{item.source}</td>
                <td className="py-3 px-4">
                  <button onClick={() => togglePublish(item)} className={`px-2 py-0.5 rounded text-xs font-semibold ${item.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.published ? 'Published' : 'Draft'}</button>
                </td>
                <td className="py-3 px-4"><div className="flex gap-2">
                  <button onClick={() => { setDraft({ ...item }); setMode('edit') }} className="text-blue-600 text-xs hover:underline">Edit</button>
                  <button onClick={() => del(item.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No testimonials yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const I = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
function F({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <div><label className="block text-sm font-semibold text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>{children}</div>
}
function C(m: string) {
  return `mb-4 px-4 py-2 rounded-lg text-sm ${m.includes('Error') || m.includes('required') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`
}
