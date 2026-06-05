'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const NAV = [
  { href: '/admin',             label: 'Dashboard',     icon: '◈' },
  { href: '/admin/profile',     label: 'Profile',       icon: '👤' },
  { href: '/admin/experiences', label: 'Experiences',   icon: '📋' },
  { href: '/admin/achievements',label: 'Achievements',  icon: '🏆' },
  { href: '/admin/testimonials',label: 'Testimonials',  icon: '💬' },
  { href: '/admin/projects',    label: 'Projects',      icon: '🚀' },
  { href: '/admin/writeup',     label: 'Write-up',      icon: '📝' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 bg-slate-900 border-r border-slate-700/50">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <p className="font-bold text-white tracking-wide text-sm uppercase">Portfolio CMS</p>
        <p className="text-slate-400 text-xs mt-0.5">Admin Dashboard</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(item => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <span>↗</span> View Public Site
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-400 hover:bg-red-900/40 hover:text-red-300 transition-all"
        >
          <span>→</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
