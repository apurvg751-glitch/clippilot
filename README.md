# ClipPilot — Modern Video Clipping & Social Media Management Dashboard

ClipPilot is a creator command studio designed for short-form video creators publishing to **YouTube Shorts**, **Instagram Reels**, and **TikTok**.

---

## Key Features

1. **Overview Dashboard**
   - Combined platform views (clearly noted as non-deduplicated platform totals).
   - Multi-platform audience counter and engagement ratios.
   - Interactive Recharts area chart for 30-day audience accretion.
   - Channel comparison bars for YouTube Shorts vs Instagram Reels vs TikTok.
   - Ranked list of top-performing vertical clips.

2. **Video Library**
   - Local and cloud vertical asset ingestion with drag-and-drop.
   - 9:16 aspect ratio preview, duration timers, and file size tracking.
   - Platform-tailored captions & hashtag customizers per channel.
   - Status filters: *Draft*, *Ready*, *Scheduled*, *Published*, *Failed*.

3. **Publishing Centre**
   - High-fidelity **Interactive Mobile Phone Preview** (switch between YouTube Shorts, Instagram Reels, and TikTok mockup skins).
   - Multi-channel selector with official API connection status checks.
   - Immediate dispatch vs scheduled date & time release.
   - Multi-stage upload progress simulation with official verification.

4. **Analytics & Comparison**
   - Sortable video telemetry table with direct links to live posts.
   - **Cross-Platform Comparison Modal**: Open any video and compare YouTube Shorts vs Instagram Reels vs TikTok metrics head-to-head.
   - One-click CSV export for external reporting.

5. **Platform Accounts**
   - Dedicated connection cards for YouTube, Instagram, and TikTok.
   - OAuth 2.0 configuration guide and required official scopes.
   - Transparent metric reporting ("Not available" displayed if an API does not expose aggregated counts).

6. **Growth Tracker**
   - Day-by-day views AreaChart with channel filters.
   - Cumulative followers/subscribers LineChart.
   - Top 10 videos by views horizontal bar chart.
   - Weekly (+18.4%) and monthly (+32.6%) growth delta callouts.

7. **Content Planner**
   - **Kanban Pipeline**: Track concepts from *Idea Backlog* → *Scripting / Hook* → *In Production / Edit* → *Ready to Publish* → *Published / Live*.
   - **Monthly Calendar View**: Visual schedule of upcoming releases.
   - Direct "Go to Publisher" shortcut for ready ideas.

8. **Settings & Demo Mode**
   - Toggle **Demo Mode** ON/OFF to explore realistic sample metrics or work with live accounts.
   - Restore default sample data at any time.
   - Supabase connection status check.
   - Export Video Performance and 30-Day Growth spreadsheets as CSV.

---

## Tech Stack

- **Framework**: Next.js 14+ / 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with dark charcoal & violet/cyan creator theme
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database & Auth**: Supabase (PostgreSQL schema with 8 tables and Row-Level Security)
- **Local Storage**: Auto-persistence of user uploads, edits, and planner pipeline stages

---

## Local Development Setup

### 1. Clone & Install Dependencies
```bash
cd clippilot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(ClipPilot includes full Demo Mode and local storage fallback, so you can run and test all features immediately even before configuring API keys).*

### 3. Apply Supabase Database Schema (Optional)
Run the migration script located at `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Security & API Compliance

- **No Scraping or Automated Password Logins**: ClipPilot relies exclusively on official REST and OAuth 2.0 endpoints (YouTube Data API v3, Meta Content Publishing API, TikTok Content Posting API v2).
- **Zero Password Storage**: Social media passwords are never asked, accepted, or stored.
- **Row-Level Security (RLS)**: Private video assets and account metrics are isolated strictly to authenticated owners.
