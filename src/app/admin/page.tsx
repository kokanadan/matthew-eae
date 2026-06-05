import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'

const SECTIONS = [
  { href: '/admin/profile',      label: 'Profile',      icon: '👤', desc: 'Name, photo, skills, intro'         },
  { href: '/admin/experiences',  label: 'Experiences',  icon: '📋', desc: 'Activities, roles, CCA, leadership' },
  { href: '/admin/achievements', label: 'Achievements', icon: '🏆', desc: 'Awards, competitions, certificates'  },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '💬', desc: 'Teacher comments, references'        },
  { href: '/admin/projects',     label: 'Projects',     icon: '🚀', desc: 'Personal and school projects'        },
  { href: '/admin/writeup',      label: 'Write-up',     icon: '📝', desc: 'Personal statement, reflections'     },
]

async function getCounts() {
  try {
    const supabase = await createClient()
    const [exp, ach, test, proj] = await Promise.all([
      supabase.from('experiences').select('id, published'),
      supabase.from('achievements').select('id, published'),
      supabase.from('testimonials').select('id, published'),
      supabase.from('projects').select('id, published'),
    ])
    const count = (data: any[], pub = false) =>
      pub ? data?.filter(d => d.published).length ?? 0 : data?.length ?? 0
    return {
      exp_total: count(exp.data ?? []),  exp_pub: count(exp.data ?? [], true),
      ach_total: count(ach.data ?? []),  ach_pub: count(ach.data ?? [], true),
      test_total: count(test.data ?? []), test_pub: count(test.data ?? [], true),
      proj_total: count(proj.data ?? []), proj_pub: count(proj.data ?? [], true),
    }
  } catch { return null }
}

export default async function AdminDashboard() {
  const counts = await getCounts()
  const now    = formatDate(new Date().toISOString())

  const stats = counts ? [
    { label: 'Experiences',  total: counts.exp_total,  pub: counts.exp_pub  },
    { label: 'Achievements', total: counts.ach_total,  pub: counts.ach_pub  },
    { label: 'Testimonials', total: counts.test_total, pub: counts.test_pub },
    { label: 'Projects',     total: counts.proj_total, pub: counts.proj_pub },
  ] : []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Last loaded: {now}</p>
      </div>

      {/* Stats bar */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.total}</p>
              <p className="text-xs text-emerald-600 mt-1">{s.pub} published</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Manage Content</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map(sec => (
          <Link
            key={sec.href}
            href={sec.href}
            className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{sec.icon}</span>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {sec.label}
              </h3>
            </div>
            <p className="text-slate-500 text-sm">{sec.desc}</p>
            <p className="text-blue-500 text-xs font-semibold mt-3 group-hover:underline">
              Manage →
            </p>
          </Link>
        ))}
      </div>

      {/* Help */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">Getting Started</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Start with <strong>Profile</strong> — add your name, photo, and skills</li>
          <li>Add <strong>Experiences</strong> and mark them as Published</li>
          <li>Add <strong>Achievements</strong>, <strong>Projects</strong>, and <strong>Testimonials</strong></li>
          <li>Write your personal <strong>Write-up</strong> with reflections</li>
          <li>View the <strong>public site</strong> to see how it looks</li>
        </ol>
      </div>
    </div>
  )
}
