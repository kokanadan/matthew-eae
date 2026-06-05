'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [tab, setTab]         = useState<'url' | 'upload'>('url')
  const [uploading, setUp]    = useState(false)
  const [error, setError]     = useState('')
  const fileRef               = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    setUp(true); setError('')
    try {
      const supabase = createClient()
      const bucket   = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'portfolio-media'
      const ext      = file.name.split('.').pop()
      const path     = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally { setUp(false) }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>

      {/* Tab switcher */}
      <div className="flex rounded overflow-hidden border border-slate-200 w-fit text-sm">
        {(['url', 'upload'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 font-medium capitalize transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t === 'url' ? 'URL' : 'Upload File'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
          {uploading ? (
            <p className="text-blue-600 text-sm font-medium">Uploading…</p>
          ) : (
            <>
              <p className="text-slate-500 text-sm">Click to choose file</p>
              <p className="text-slate-400 text-xs mt-1">Images or PDF · Max 10MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative group w-fit">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-36 object-cover rounded border border-slate-200"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
