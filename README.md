# 🌊 Portfolio — Underwater RPG Style

A full-stack personal portfolio website with a deep-sea, electric-blue RPG aesthetic. Built with **Next.js 14**, **Tailwind CSS**, and **Supabase** (Auth + Database + Storage).

---

## ✨ Features

**Public Portfolio**
- Stunning underwater RPG design — deep navy, electric blue, cyan glow
- Animated rising bubble canvas background
- Six fully animated sections with scroll-triggered effects
- Glass-morphism cards with hover glow and scan-line effects
- Animated skill stat bars
- Clickable photo gallery with lightbox
- Diagonal section dividers and parallax hero
- Fully responsive (mobile, tablet, desktop)
- Only **published** content shown

**Admin CMS Dashboard**
- Secure login via Supabase Auth
- Manage all 6 sections from a clean dashboard
- Add / Edit / Delete any content
- Toggle **Draft ↔ Published** instantly
- Drag-and-drop **reorder** rows
- **Image upload** to Supabase Storage or paste a URL
- Photo captions on every item
- Timestamp of last update shown

---

## 🚀 Quick Setup

### 1. Clone / Download

```bash
cd portfolio
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In the **SQL editor**, run the full contents of `supabase/schema.sql`
3. Go to **Storage** → **New bucket**
   - Name: `portfolio-media`
   - Make it **Public**
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif, application/pdf`

### 3. Create an admin user

In Supabase Dashboard → **Authentication** → **Users** → **Add user**
- Use any email + a strong password
- This is your login for the admin dashboard

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STORAGE_BUCKET=portfolio-media
```

Find these in Supabase Dashboard → **Settings** → **API**.

### 5. Run locally

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin CMS: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Public portfolio (server component)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Design system CSS variables + animations
│   └── admin/
│       ├── layout.tsx           # Admin layout with sidebar
│       ├── page.tsx             # Dashboard overview
│       ├── login/page.tsx       # Login page
│       ├── profile/page.tsx     # Edit profile + skills
│       ├── experiences/page.tsx # CRUD for experiences
│       ├── achievements/page.tsx
│       ├── testimonials/page.tsx
│       ├── projects/page.tsx
│       └── writeup/page.tsx     # Personal statement editor
├── components/
│   ├── public/                  # All public-facing UI components
│   │   ├── BubbleCanvas.tsx     # Animated bubble background
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── SkillBar.tsx
│   │   ├── ExperiencesSection.tsx
│   │   ├── AchievementsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── WriteupSection.tsx
│   │   └── ImageModal.tsx       # Lightbox with keyboard nav
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── ImageUpload.tsx      # URL or file-upload tabs
├── lib/
│   ├── supabase-browser.ts      # Client-side Supabase
│   ├── supabase-server.ts       # Server-side Supabase (cookies)
│   └── utils.ts                 # Helpers, constants
├── middleware.ts                 # Route protection for /admin/*
└── types/index.ts               # All TypeScript interfaces
supabase/
└── schema.sql                   # Full database schema + RLS policies
```

---

## 🗄️ Database Tables

| Table          | Description                         |
|----------------|-------------------------------------|
| `profile`      | Single row: name, photo, intro, etc |
| `skills`       | Skill bars linked to profile         |
| `experiences`  | Activities, CCA, leadership roles    |
| `achievements` | Awards, certificates, milestones    |
| `testimonials` | Teacher comments, references        |
| `projects`     | Personal / school projects          |
| `writeup`      | Personal statement (single row)     |

All content tables have: `published` (boolean), `display_order` (integer), `updated_at` (timestamp), `photos`/`photo` (JSONB).

**Row Level Security:**
- Public users → read only published content
- Authenticated admin → full read/write access

---

## 🎨 Design System

CSS variables defined in `globals.css`:

| Variable          | Value                        | Usage                  |
|-------------------|------------------------------|------------------------|
| `--bg-void`       | `#020509`                    | Deepest background     |
| `--blue-core`     | `#1a6bff`                    | Primary accent         |
| `--cyan-accent`   | `#00d0f0`                    | Highlights, glows      |
| `--text-bright`   | `#d8eaff`                    | Headings               |
| `--text-body`     | `#8bacc8`                    | Body text              |
| `--border-dim`    | `rgba(0,180,255,0.25)`       | Card borders           |
| `--glow-blue`     | `0 0 20px rgba(0,140,255,.35)` | Hover glow shadow    |

Key utility classes: `.glass-card`, `.btn-glow`, `.section-heading`, `.tag`, `.glow-rule`, `.scan-hover`, `.fade-in-ready`

---

## 🌐 Deployment (Vercel)

```bash
npm run build   # Check for errors first
```

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

---

## 💡 Tips

- **Placeholder data** is built in — the site looks complete even before Supabase is connected
- Start with the **Profile** section to personalise the hero immediately
- Items remain hidden on the public site until you toggle them to **Published**
- Use the **drag handle (⠿)** in admin tables to reorder items
- The **Write-up** section is always visible (no publish gate) — save and it shows immediately
- Upload high-quality photos; they're displayed in a lightbox with keyboard navigation
- The public site auto-refreshes every 60 seconds (`revalidate = 60`)

---

## 📝 Customisation

**Changing fonts:** Edit the Google Fonts import in `globals.css`

**Adding a new section:** 
1. Add table to `schema.sql`
2. Add interface to `types/index.ts`
3. Create public component in `components/public/`
4. Add admin page in `app/admin/`
5. Fetch data in `app/page.tsx`

**Colour changes:** Update CSS variables in `globals.css` `:root` block
