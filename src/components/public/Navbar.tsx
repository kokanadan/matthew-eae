'use client'

import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { label: 'Profile',     href: '#profile'      },
  { label: 'Experiences', href: '#experiences'  },
  { label: 'Achievements',href: '#achievements' },
  { label: 'Testimonials',href: '#testimonials' },
  { label: 'Projects',    href: '#projects'     },
  { label: 'Write-up',   href: '#writeup'      },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('')
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      // Find active section
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.querySelector(item.href)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(item.href)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(4, 8, 20, 0.92)'
          : 'rgba(4, 8, 20, 0)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,180,255,0.15)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#profile"
          className="font-display font-700 text-xl uppercase tracking-[0.15em]"
          style={{
            background: 'linear-gradient(90deg, #00d0f0, #2288ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Portfolio
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="relative font-condensed font-600 text-sm uppercase tracking-[0.1em] px-4 py-2 transition-all duration-200 group"
                style={{ color: active === item.href ? 'var(--cyan-bright)' : 'var(--text-body)' }}
                onClick={() => setActive(item.href)}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-2 right-2 h-px transition-all duration-300"
                  style={{
                    background: 'var(--cyan-accent)',
                    opacity: active === item.href ? 1 : 0,
                    boxShadow: '0 0 8px var(--cyan-accent)',
                  }}
                />
                <span
                  className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(0, 160, 220, 0.06)' }}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block h-px w-6 transition-all duration-300"
              style={{ background: 'var(--cyan-accent)' }}
            />
          ))}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden border-t py-4"
          style={{
            background: 'rgba(4, 8, 24, 0.97)',
            borderColor: 'rgba(0, 180, 255, 0.15)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block font-condensed font-600 uppercase tracking-widest text-sm px-8 py-3 transition-colors"
              style={{ color: 'var(--text-body)' }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
