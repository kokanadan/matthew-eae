'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { MediaItem } from '@/types'

interface LightboxProps {
  items: MediaItem[]
  initialIndex?: number
  onClose: () => void
}

export function Lightbox({ items, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [items.length, onClose])

  const item = items[index]
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(2,5,12,0.95)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] mx-4 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 font-condensed text-sm uppercase tracking-widest transition-colors"
          style={{ color: 'var(--text-body)' }}
        >
          Close ✕
        </button>

        {/* Image */}
        <div
          className="relative rounded overflow-hidden"
          style={{ border: '1px solid var(--border-glow)', boxShadow: 'var(--glow-blue)' }}
        >
          <img
            src={item.url}
            alt={item.caption}
            className="max-w-full max-h-[75vh] object-contain"
          />
        </div>

        {/* Caption */}
        {item.caption && (
          <p
            className="mt-3 text-sm text-center"
            style={{ color: 'var(--text-body)' }}
          >
            {item.caption}
          </p>
        )}

        {/* Nav arrows */}
        {items.length > 1 && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setIndex(i => (i - 1 + items.length) % items.length)}
              className="font-display font-700 text-2xl px-4 py-1 transition-colors"
              style={{ color: 'var(--cyan-accent)' }}
            >
              ← Prev
            </button>
            <span className="self-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {index + 1} / {items.length}
            </span>
            <button
              onClick={() => setIndex(i => (i + 1) % items.length)}
              className="font-display font-700 text-2xl px-4 py-1 transition-colors"
              style={{ color: 'var(--cyan-accent)' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Clickable image thumbnail that opens the lightbox */
export function ImageGallery({ items }: { items: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  if (!items?.length) return null

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-4">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="group relative overflow-hidden rounded"
            style={{ border: '1px solid var(--border-dim)' }}
          >
            <img
              src={item.url}
              alt={item.caption}
              className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div
              className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100"
              style={{ background: 'rgba(0,140,255,0.3)' }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
