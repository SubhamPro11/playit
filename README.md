# 📻 Airwaves

> A curated directory of independent web radio, audio playlists & soundscape projects. Human-picked. No algorithms. Zero ads.

<p align="left">
  <a href="https://github.com/SubhamPro11/airwaves/blob/main/LICENSE"><img src="https://img.shields.io/github/license/SubhamPro11/airwaves?style=for-the-badge&color=39FF14&labelColor=0a0e14" alt="License" /></a>
  <a href="https://github.com/SubhamPro11/airwaves/stargazers"><img src="https://img.shields.io/github/stars/SubhamPro11/airwaves?style=for-the-badge&color=39FF14&labelColor=0a0e14" alt="GitHub Stars" /></a>
  <a href="https://playit.morbius.workers.dev"><img src="https://img.shields.io/badge/Cloudflare_Workers-live-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Deployment" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Backend" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React & TypeScript" /></a>
</p>

[**🌐 Live Site → playit.morbius.workers.dev**](https://playit.morbius.workers.dev)

⭐ **Star this repo** to get new drops first — new categories, new stations, and upcoming redesigns get announced here ([Releases](https://github.com/SubhamPro11/airwaves/releases) / [Discussions](https://github.com/SubhamPro11/airwaves/discussions)) before they hit the live site.

---

## ✨ What It Is

**Airwaves** (formerly *PlayIt*) is a curated single-playlist showcase of **70+ independent web radio, audio playlists, and ambient soundscape projects**, organized into 7 distinct categories. Every single entry is hand-picked — nothing here is auto-scraped, sponsored, or ranked by an algorithm.

- 🎧 **70+ Curated Stations** across 7 distinct categories (Lofi & Chill, Ambient & Nature, Electronic & Synth, Jazz & Classical, Indie & Alternative, World & Experimental, Focus & Study)
- 🌑 **Sleek Dark Theme** with amber/orange neon accents — crafted to be easy on the eyes for extended deep-focus and listening sessions
- 🚫 **Zero Ads & Trackers** — no surveillance capitalism, no algorithmic feedback loops
- 🔗 **Permalinks to Every Entry** with dynamic OpenGraph meta previews and rich station details
- 🔀 **Shuffle, Search & Favorites** — easily search by genre, keyword, or randomize your next session
- 🩺 **Dead-Link Monitoring** — built-in health checks so listed stations remain reachable and playable
- 🙏 **Creator Credit on Every Entry** — direct attribution and links to original authors and broadcasters
- 🛠️ **Full Admin Dashboard** — for managing stations, reviewing community submissions, viewing subscriber lists, and editing site config

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + PostCSS + Custom CSS Utilities
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Storage Layer**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security) with client-side fallback storage
- **Authentication**: Supabase Auth (Email / Password authentication with role-based access control)
- **Deployment & Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/) / Pages with static HTML pre-rendering

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SubhamPro11/airwaves.git
   cd airwaves
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Configure your keys inside `.env`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
   VITE_SITE_URL=https://airwaves.dpdns.org
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔐 Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | The REST / API URL for your Supabase project instance | Yes (for live DB sync) |
| `VITE_SUPABASE_ANON_KEY` | The public anonymous API key for client-side queries | Yes (for live DB sync) |
| `VITE_SITE_URL` | Canonical public URL used for SEO and OpenGraph permalinks | Optional |

> **Note:** If Supabase environment variables are omitted, Airwaves automatically falls back to static seed data with local `localStorage` persistence.

---

## 🤝 Contributing

Contributions are welcome — especially new station submissions!

- **Adding a station:** Submit via the on-site **"Suggest a Station"** modal, open a Pull Request, or open an Issue with the station details.
- **Bug fixes & Features:** Please open an Issue first for anything non-trivial so we can align on design and approach before writing code.
- **Design consistency:** Keep all UI aligned with the dark theme, amber/orange neon accents, and distraction-free philosophy.

See [CONTRIBUTING.md](CONTRIBUTING.md) for further guidelines and station submission formatting.

---

## 🗺️ Roadmap

- [x] Responsive player interface & category navigation
- [x] Station permalinks with custom SEO and OG previews
- [x] Community station suggestion modal & admin review pipeline
- [ ] Visual redesign & advanced audio visualizer modes (in progress)
- [ ] More curated niches and micro-genre categories
- [ ] Expanded admin telemetry and automated link status cron checks

Track progress, release notes, and upcoming feature polls in [Releases](https://github.com/SubhamPro11/airwaves/releases) and [Discussions](https://github.com/SubhamPro11/airwaves/discussions).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💖 Credits & Acknowledgments

- Built and maintained by [**Subham Kumar (Cryo)**](https://github.com/SubhamPro11).
- Every radio station, live broadcast, and soundscape listed is credited to its respective creator/broadcaster on its entry page.
