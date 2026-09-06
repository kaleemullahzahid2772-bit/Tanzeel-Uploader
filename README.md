# Nūr Social — AI-Powered Islamic Social Media Manager

> **Phase 1: Foundation, Islamic Visual Identity, Media Management & Security**

Nūr Social is an intelligent, multi-channel social media management platform built with a modern SaaS architecture and an elegant Islamic visual identity.

---

## ✦ Tech Stack

* **Framework**: Next.js 15 (App Router, Server Components & Client Hooks)
* **Language**: TypeScript (Strict Mode)
* **Styling**: Tailwind CSS (Custom Islamic Emerald & Gold Palette)
* **Database & Auth**: Supabase PostgreSQL + Supabase Auth + Supabase Storage
* **Icons**: Lucide Icons
* **Security**: PostgreSQL Row Level Security (RLS) & Server-side Session Middleware

---

## ✦ Islamic Visual Identity & Palette

* **Primary Emerald**: `#0F4C3A` & `#083B2E`
* **Secondary Gold**: `#C9A227` & `#DFBE58`
* **Warm Ivory & Cream**: `#FFFDF7` & `#F8F4E8`
* **Charcoal**: `#18201C`
* **Motifs**: Custom SVG 8-point geometric star (*Khatam*) pattern, ornamental dividers, and subtle architectural borders.

---

## ✦ Project Structure

```
├── app/
│   ├── layout.tsx                     # Root layout with Inter & Amiri typography
│   ├── globals.css                    # Tailwind tokens, Islamic scrollbar & theme
│   ├── page.tsx                       # Landing page & feature preview
│   ├── login/page.tsx                 # Supabase authentication & sandbox login
│   ├── signup/page.tsx                # User registration & profile creation
│   └── dashboard/
│       ├── layout.tsx                 # Protected dashboard shell & auth guard
│       ├── page.tsx                   # Statistics, quick draft & recent media
│       ├── create-post/page.tsx       # Post drafting studio & media picker
│       ├── media/page.tsx             # Media library (Image/Video, grid, preview)
│       ├── settings/page.tsx          # Profile, Brand Settings & Content Prefs
│       ├── calendar/page.tsx          # Phase 6 roadmap preview
│       ├── accounts/page.tsx          # Phase 4 roadmap preview
│       └── analytics/page.tsx         # Phase 7 roadmap preview
│
├── components/
│   ├── islamic/
│   │   ├── BrandMark.tsx              # Nūr Social logo & geometric emblem
│   │   ├── IslamicPattern.tsx         # Reusable SVG Girih / Khatam star pattern
│   │   └── IslamicDivider.tsx         # Golden/Emerald ornamental divider
│   ├── dashboard/
│   │   ├── Header.tsx                 # Islamic greeting, Hijri date, user menu
│   │   ├── Sidebar.tsx                # Responsive navigation & mobile drawer
│   │   ├── StatsGrid.tsx              # 4 Live metric cards from PostgreSQL
│   │   ├── QuickDraftCard.tsx         # Action card linking to create post
│   │   └── RecentMediaSection.tsx     # Recent media grid with empty state
│   ├── media/
│   │   ├── MediaDropzone.tsx          # Drag & drop upload (JPG/PNG/WEBP/MP4/MOV)
│   │   ├── MediaCard.tsx              # Card with preview, duration, badges
│   │   ├── MediaPreviewModal.tsx      # High-res image & HTML5 video player
│   │   └── DeleteConfirmModal.tsx     # Delete confirmation & storage cleanup
│   └── ui/
│       ├── Button.tsx                 # Emerald, gold, outline & ghost variants
│       ├── Input.tsx                  # Input with gold focus rings & error slots
│       ├── Textarea.tsx               # Textarea input
│       ├── Modal.tsx                  # Accessible dialog with backdrop blur
│       ├── Card.tsx                   # Container with subtle Islamic corners
│       └── Badge.tsx                  # Status badges (ready, draft, uploaded)
│
├── lib/
│   ├── context/
│   │   └── AuthContext.tsx            # Auth provider with live Supabase & sandbox
│   ├── supabase/
│   │   ├── client.ts                  # Browser client with SSR support
│   │   ├── server.ts                  # Server client with cookie handling
│   │   └── middleware.ts              # Session refresh helper
│   ├── types/
│   │   └── database.ts                # TypeScript entity definitions
│   └── utils/
│       └── formatters.ts              # File sizes, dates, Hijri calculator
│
├── supabase/
│   └── migrations/
│       └── 20260904_phase1_init.sql   # Complete PostgreSQL schema & RLS policies
│
└── middleware.ts                      # Route protection middleware
```

---

## ✦ Getting Started

### 1. Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** tab.
3. Paste the contents of `supabase/migrations/20260904_phase1_init.sql` and run it.
4. Copy your **Project URL** and **Anon Public Key** from **Project Settings → API**.

### 2. Configure Environment Variables

Create `.env.local` in the root folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start using Nūr Social.

---

## ✦ Sandbox / Demo Mode

If Supabase keys have not been configured yet, Nūr Social automatically launches in an interactive **Sandbox Mode**. You can click **"Instant Sandbox Demo Access"** on the login page to immediately test uploading images/videos, drafting posts, filtering media, and modifying profile/brand settings in a fully isolated local environment.
