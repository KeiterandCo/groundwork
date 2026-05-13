# Groundwork Kickoff

## Overview
Groundwork is a multi-user session logger for builders. Astro, Tailwind, Supabase, Netlify. Users log build sessions manually, the analysis layer surfaces patterns over time. This kickoff covers all phases in sequence. Read the spec before starting any phase. Read the previous phase's handoff note before starting any phase after phase 1.

Total phases: 4

---

## Phase 1: Foundation, auth, and landing page

### Context
Groundwork is a new standalone web app. Nothing exists yet. This phase stands up the full project scaffold, Supabase connection, auth flow, and the public-facing landing page.

### What you're building this phase
- Full Astro project scaffold with Tailwind
- Supabase client setup and environment variables
- Auth pages: `/login` and `/signup` with email/password via Supabase Auth
- Session persistence and protected route middleware
- Public landing page at `/`
- Branded 404 page
- CLAUDE.md in repo root
- Git init, GitHub repo creation under KeiterandCo org (`groundwork`), initial push, Netlify site creation and link

### File structure
```
groundwork/
├── CLAUDE.md
├── groundwork-decision-log.md
├── groundwork-spec.md
├── groundwork-kickoff.md
├── .env.local
├── .gitignore
├── netlify.toml
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
├── src/
│   ├── middleware.ts          (protected route handling)
│   ├── lib/
│   │   └── supabase.ts        (supabase client)
│   ├── layouts/
│   │   ├── BaseLayout.astro   (head, fonts, global styles)
│   │   └── AppLayout.astro    (logged-in shell with nav)
│   ├── pages/
│   │   ├── index.astro        (landing page)
│   │   ├── login.astro
│   │   ├── signup.astro
│   │   ├── dashboard.astro    (STUB - phase 2)
│   │   ├── log/
│   │   │   ├── index.astro    (STUB - phase 3)
│   │   │   └── new.astro      (STUB - phase 2)
│   │   ├── analysis.astro     (STUB - phase 4)
│   │   ├── review.astro       (STUB - phase 4)
│   │   └── 404.astro
│   ├── components/
│   │   ├── Nav.astro
│   │   └── AuthForm.astro     (shared login/signup form component)
│   └── styles/
│       └── global.css
└── public/
    └── favicon.svg
```

### Dependencies
```json
{
  "@astrojs/tailwind": "latest",
  "@supabase/supabase-js": "latest",
  "@astrojs/node": "latest",
  "astro": "latest",
  "tailwindcss": "latest"
}
```

### netlify.toml
```toml
[build]
  command = "npx astro build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### Environment variables
```
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase setup required before build
Run these SQL statements in the Supabase SQL editor:

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Log entries table
create table log_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  session_date date not null,
  project_name text not null,
  model_used text,
  session_type text,
  what_got_stuck text not null,
  blocker_categories text[] default '{}',
  what_id_do_differently text,
  tools_used text[] default '{}',
  outcome text,
  notes text
);

-- RLS
alter table log_entries enable row level security;
create policy "Users can view own entries" on log_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on log_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on log_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on log_entries for delete using (auth.uid() = user_id);
```

### Design tokens (CSS variables in global.css)
```css
:root {
  --color-bg: #0e0e0e;
  --color-surface: #161616;
  --color-surface-2: #1e1e1e;
  --color-border: #2a2a2a;
  --color-text: #e8e8e8;
  --color-text-muted: #888888;
  --color-accent: #b8f251;        /* sharp chartreuse, the one memorable color */
  --color-accent-dim: #7aaa2e;
  --color-danger: #ff4d4d;
  --color-success: #4dff91;
  --font-display: 'DM Mono', monospace;   /* preloaded, used for headings and labels */
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
```

Font loading in BaseLayout.astro head:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
```

### Landing page spec
Dark, atmospheric, builder-to-builder. Not a SaaS marketing page.

Sections:
1. **Hero**: dark background with subtle noise texture overlay. Headline: "Stop learning the same lessons twice." Subheadline: "Groundwork logs your build sessions and surfaces the patterns you keep missing." Two CTAs: "Start logging" (primary, accent color) and "See how it works" (ghost). Background: near-black with faint grid lines and a single chartreuse accent line cutting diagonally, SVG-drawn.

2. **How it works**: three-step horizontal layout. Step 1: Log a session (icon: a simple pencil or terminal cursor SVG). Step 2: Build up signal (icon: stacked lines suggesting accumulation). Step 3: See the patterns (icon: a simple trend line). Each step has a one-sentence description. Dark surface cards, monospace labels.

3. **What you track**: a visual representation of the log entry fields as a dark card mockup. Shows project name, blocker category tags, model used, outcome. Looks like the actual UI, not a screenshot placeholder.

4. **The analysis layer**: a dark card with a simple bar chart SVG showing "recurring blockers" with fake data. Chartreuse bars, monospace axis labels. Headline: "See what's actually slowing you down." One-paragraph description.

5. **CTA footer section**: "Ready to see your patterns?" Sign up button (accent). Plain dark background, centered.

### Auth pages
Clean, minimal, centered card on dark background. Email and password fields. Submit button in accent color. Toggle link between login and signup. Error states inline under the relevant field. No modal, no redirect loop.

On successful signup: redirect to `/dashboard`.
On successful login: redirect to `/dashboard`.
On failed auth: show error inline, do not clear the form.

### Middleware
Protect all routes under `/dashboard`, `/log`, `/analysis`, `/review`. If no active Supabase session, redirect to `/login`. Public routes: `/`, `/login`, `/signup`, `/404`.

### 404 page
Dark background. Large monospace "404" in accent color. One line of copy that fits the builder tone: "This page doesn't exist. Check the URL or head back to your dashboard." Link home. No nav needed.

### CLAUDE.md content
```markdown
# CLAUDE.md — Groundwork

## Copy standards (travel with every output)
- No em dashes, ever. Use commas, periods, or restructure.
- No AI language. If it wouldn't come out of your mouth, rewrite it.
- No contrast framing ("this isn't X, it's Y")
- No engagement bait or false suspense
- No therapy speak
- No "Best," sign-offs. Use "Best wishes" or "Thank you."
- No corporate or agency tone
- US English spelling and conventions
- Voice: builder-to-builder, direct, no fluff

## Build standards
- WCAG 2.2 AA on every view
- Color contrast checked on all text-on-background combinations
- Keyboard navigable throughout
- All form fields labeled with clear validation and error states
- Font loading: preload, font-display swap, fallback stack

## Stack
- Astro, Tailwind, Supabase, Netlify
- Supabase client in src/lib/supabase.ts
- Protected routes via middleware.ts
- Row-level security: users see only their own data

## Conventions
- No em dashes in any output, ever
- Stub files for phases not yet built, with clear comment noting which phase builds them
- Every response includes localhost preview URL
```

### Phase 1 done when
- [ ] Astro project scaffolded with Tailwind and Supabase client
- [ ] .env.local configured and gitignored
- [ ] Supabase tables and RLS policies created
- [ ] Landing page complete with all five sections
- [ ] Login and signup pages working with Supabase Auth
- [ ] Session persistence working (refresh keeps you logged in)
- [ ] Middleware protecting logged-in routes
- [ ] Dashboard, log, analysis, review pages exist as stubs with clear comments
- [ ] 404 page present and on-brand
- [ ] CLAUDE.md in repo root
- [ ] Git initialized, repo created under KeiterandCo org as `groundwork`, pushed to main
- [ ] Netlify site created via CLI, linked to repo, auto-deploy configured
- [ ] Netlify live URL included in response

### Phase 1 handoff format
Save as `phase-1-handoff.md` in project root.

---

## Phase 2: Dashboard and log entry form

Read `phase-1-handoff.md` before writing any code.

### Context
Foundation and auth are complete. Users can sign up and log in. This phase builds the main logged-in experience: the dashboard overview and the new entry form.

### What you're building this phase
- Dashboard at `/dashboard`: recent entries, quick stats, quick-add button
- New entry form at `/log/new`: full form with all fields, saves to Supabase
- AppLayout with logged-in nav (dashboard, new entry, log, analysis, review, logout)
- Basic entry confirmation state after save

### Dashboard spec
Two-column layout on desktop (single column on tablet).

Left column (wider):
- "Recent entries" heading (monospace label style)
- Last 10 entries as a compact list: project name, session date, top blocker tag (first tag), outcome badge. Click any row to expand inline (show what_got_stuck and what_id_do_differently fields). No separate detail page needed in v1.
- "View all" link to `/log`

Right column (narrower):
- Quick stats card: total entries, entries this month, most logged project, most common blocker category
- Quick-add button: large, accent color, full width of column, "Log a session" label

Empty state (no entries yet): dark card with monospace copy: "Nothing logged yet. Start with your next build session." and a "Log your first session" CTA.

### New entry form spec
Single column, full form. All fields from the spec.

Field details:
- **Session date**: date input, default today
- **Project name**: text input, required, placeholder: "Which project or build was this?"
- **Model used**: select with options: Claude Sonnet, Claude Opus, Claude Haiku, GPT-4o, Gemini, Other. If Other, show a text input.
- **Session type**: select: Spec, Kickoff, Build, Review, Research, Personal project, Other
- **What got stuck**: textarea, required, 4 rows, placeholder: "Describe the friction or blocker in plain language."
- **Blocker categories**: multi-select tag picker. Tags: Prompt clarity, Scope drift, Context window limit, Model misinterpretation, Spec gap, Architecture mismatch, Tool access, Decision paralysis, External dependency, Time / energy, Other. Clicking a tag toggles it. Selected tags show in accent color.
- **What you'd do differently**: textarea, 3 rows, placeholder: "What's the lesson?"
- **Tools used**: multi-select tag picker. Options: Claude.ai, VSCode chat, Cowork, Terminal, GitHub, Netlify, Supabase, Other.
- **Outcome**: select: Resolved, Deferred, Abandoned, Ongoing
- **Notes**: textarea, 3 rows, optional, placeholder: "Anything else worth capturing."

Submit button: "Save entry" in accent color, full width on mobile. On submit: validate required fields inline, save to Supabase, redirect to dashboard with a success toast. On error: show error inline, do not clear the form.

### AppLayout nav
Top nav bar, dark surface background, border-bottom in --color-border.
Left: "Groundwork" wordmark in DM Mono, accent color.
Right: Dashboard, Log a session (accent button), Log, Analysis, Review, and a logout link.
Mobile: collapse to hamburger. Nav items in a full-width dropdown panel.

### Phase 2 done when
- [ ] Dashboard loads with recent entries list and quick stats
- [ ] Empty state renders correctly when no entries exist
- [ ] New entry form renders all fields correctly
- [ ] All required field validation works inline
- [ ] Tag pickers work for blocker categories and tools used
- [ ] Entry saves to Supabase and appears in dashboard immediately
- [ ] Success toast appears after save
- [ ] AppLayout nav present on all logged-in pages
- [ ] Mobile nav collapses and expands correctly
- [ ] Contrast checked on all new UI elements

### Phase 2 handoff format
Save as `phase-2-handoff.md` in project root.

---

## Phase 3: Full log view with filters

Read `phase-2-handoff.md` before writing any code.

### Context
Dashboard and entry form are working. Users can log sessions and see recent entries. This phase builds the full log view with filtering and sorting.

### What you're building this phase
- Full log view at `/log`
- Filter panel: project name (text search), model used (select), session type (select), blocker category (multi-select), outcome (select), date range (start and end date inputs)
- Sort controls: date (default descending), project name, blocker category
- Paginated results (20 per page)
- Expanded entry detail on row click (inline, not a separate page)
- Edit and delete actions on each entry

### Full log view spec
Two-section layout: filter panel (collapsible sidebar or top panel, designer's call based on layout) and results.

Results table columns: Date, Project, Model, Blocker categories (tag chips), Outcome badge, expand chevron.

Expanded row: shows all fields in a readable layout. Edit button opens the entry form pre-filled. Delete button shows an inline confirmation ("Delete this entry?" Yes / Cancel) before removing.

Empty state with active filters: "No entries match these filters." with a clear filters link.

Pagination: previous / next with page count. Simple, no infinite scroll.

### Phase 3 done when
- [ ] Full log view loads all user entries paginated correctly
- [ ] All filter controls work and update results
- [ ] Sort controls work
- [ ] Row expand shows full entry detail
- [ ] Edit opens pre-filled form and saves correctly
- [ ] Delete works with inline confirmation
- [ ] Empty state renders for both no entries and no filter matches
- [ ] Contrast checked on all new UI elements

### Phase 3 handoff format
Save as `phase-3-handoff.md` in project root.

---

## Phase 4: Analysis, review, and BUILDNOTES

Read `phase-3-handoff.md` before writing any code.

### Context
Logging and full log view are complete. This phase builds the analysis layer, the monthly review view, and closes out the build with BUILDNOTES.md.

### What you're building this phase
- Analysis view at `/analysis`
- Review view at `/review`
- BUILDNOTES.md

### Analysis view spec

Five sections, all client-side aggregated from the user's full log history:

**Recurring blockers**
Bar chart (SVG or CSS bars, no external chart library needed). X axis: blocker category names. Y axis: entry count. Chartreuse bars. Below the chart: a comparison line showing last 30 days vs prior 30 days for each category. Label in monospace. If a category increased, show a small up arrow in accent. If decreased, down arrow in muted color.

**By project**
Table: project name, entry count, most common blocker, outcome distribution (resolved / deferred / abandoned / ongoing as a mini bar). Sortable by entry count.

**By model**
Table: model name, entry count, top blocker categories (top two tags). Simple, no chart needed.

**Stall radar**
List of projects that have entries with outcome "ongoing" or "deferred" and no new entry in the last 14 days. Each row: project name, last entry date, days since last entry, top blocker from most recent entry. Header copy: "Projects that might need your attention."
Empty state: "No stalled projects. Nice."

**Lesson bank**
All "what you'd do differently" entries that are non-empty. Filterable by blocker category. Most recent first. Each entry shows the lesson text, project name, date, and blocker category tags. This is a scrollable list, not a table.

### Review view spec
Monthly summary. Defaults to current month, with a month picker to go back.

Shows:
- Entries logged this month (count)
- Projects touched (list)
- Top three blocker categories this month
- Outcomes breakdown (resolved / deferred / abandoned / ongoing counts)
- All lessons logged this month (from what_id_do_differently)

Copy button at the bottom: copies a plain-text synthesis to clipboard formatted as:

```
Groundwork — [Month Year] Review

Sessions logged: X
Projects: [list]
Top blockers: [list]
Outcomes: X resolved, X deferred, X abandoned, X ongoing

Lessons:
- [lesson 1]
- [lesson 2]
...
```

Toast on copy: "Copied to clipboard."

### BUILDNOTES.md
Write at the end of this phase documenting: what's working, what's deferred, known issues, suggested next priorities (see V2 signals in decision log).

### Phase 4 done when
- [ ] Analysis view loads and all five sections render correctly with real data
- [ ] Recurring blockers chart renders with correct counts
- [ ] Stall radar correctly identifies stalled projects
- [ ] Lesson bank loads and filters correctly
- [ ] Review view defaults to current month and month picker works
- [ ] Copy to clipboard works and toast appears
- [ ] Full definition of done checklist from spec passes
- [ ] BUILDNOTES.md written
- [ ] All copy standards checked across every page
- [ ] Final accessibility pass completed
- [ ] Netlify live URL confirmed working

### Phase 4 handoff format
Save as `phase-4-handoff.md` in project root. This is also the foundation for BUILDNOTES.md.
