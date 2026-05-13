# Groundwork Spec

## Product purpose

Groundwork is a lightweight session logger for builders who work with AI. You log notable sessions as they happen. The analysis layer surfaces patterns across your builds over time so you stop learning the same lessons twice.

Built for Olivia first, scoped for any builder.

---

## Core principles

1. Friction of logging must be near zero. If it takes more than two minutes to log a session, it won't happen.
2. The analysis layer is the product. The log form is just the input mechanism.
3. Manual first. Integrations come after the data model is proven.
4. Multi-user from day one. Auth is not an afterthought.
5. Builder aesthetic. This tool lives next to VSCode. It should feel like it belongs there.

---

## User flow

1. User creates an account or logs in.
2. User lands on their dashboard: recent log entries, pattern summary, quick-add button.
3. User clicks "New Entry" and fills out the log form.
4. Entry is saved to Supabase and immediately reflected in their dashboard.
5. Analysis layer updates in real time as entries accumulate.
6. User can view full log history, filter by project or blocker type, and pull a pattern summary.

---

## Feature set

### Authentication
- Email and password auth via Supabase Auth
- Session persistence (stay logged in)
- Basic profile: name, email
- Row-level security: users see only their own entries

### Log entry form
Fields:
- **Date** (auto-populated, editable): when the session happened
- **Project name** (text, required): which project or build this belongs to
- **Model used** (select): Claude Sonnet, Claude Opus, Claude Haiku, other (with text field)
- **Session type** (select): spec, kickoff, build, review, research, personal project, other
- **What got stuck** (textarea, required): plain language description of the blocker or friction point
- **Blocker category** (multi-select tag): see tag taxonomy below
- **What you'd do differently** (textarea): the lesson
- **Tools used** (multi-select): Claude.ai, VSCode chat, Cowork, terminal, other
- **Outcome** (select): resolved, deferred, abandoned, ongoing
- **Notes** (textarea, optional): anything else worth capturing

Blocker category tag taxonomy (seed list, expandable):
- Prompt clarity
- Scope drift
- Context window limit
- Model misinterpretation
- Spec gap
- Architecture mismatch
- Tool access
- Decision paralysis
- External dependency
- Time / energy
- Other

### Dashboard
- Recent entries list (last 10, with project name, date, top blocker tag, outcome)
- Quick stats: total entries, entries this month, most logged project, most common blocker
- Quick-add button always visible
- Link to full log and analysis views

### Full log view
- Paginated table of all entries
- Filter by: project name, model, session type, blocker category, outcome, date range
- Sort by: date, project, blocker category
- Click any row to expand full entry detail

### Analysis view
The reason this exists. Surfaces patterns across all log entries.

Sections:
- **Recurring blockers**: blocker categories ranked by frequency, with trend over time (last 30 days vs prior 30 days)
- **By project**: entry count per project, most common blockers per project, outcome distribution
- **By model**: which models are generating which blocker types most often
- **Stall radar**: projects with entries marked "ongoing" or "deferred" that haven't had a new entry in 14+ days
- **Lesson bank**: all "what you'd do differently" entries, filterable by blocker category, most recent first

### Review layer
- "This month" summary view: entries logged this month, top blockers, projects touched, one-click copy of a plain-text synthesis paragraph for blog or notes use
- No LLM generation in v1. Summary is a structured data view, not AI-written prose.

---

## Page list

- `/` — marketing/landing page (what Groundwork is, sign up CTA)
- `/login` — login
- `/signup` — create account
- `/dashboard` — main logged-in view
- `/log/new` — new entry form
- `/log` — full log view with filters
- `/analysis` — analysis and pattern view
- `/review` — monthly review summary
- `/404` — branded 404 page

---

## Voice and tone

Builder-to-builder. Direct, no fluff. The UI copy should sound like it was written by someone who uses the tool. No marketing speak inside the logged-in experience. The landing page can be warm but still direct.

Copy standards: no em dashes, no AI language, no contrast framing, no engagement bait. US English.

---

## Photo plan

Landing page only needs one hero visual. No photography needed. The hero should be a dark, atmospheric illustration or SVG composition: something that evokes layered notes, trail markers, or signal-in-noise. Detailed description: a dark background with faint grid lines, a few overlapping document outlines in varying opacity, a single bright accent line cutting through suggesting a signal or trend emerging from noise. Abstract, not literal. Aspect ratio 16:9.

---

## Technical foundation

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Auth and database:** Supabase (Auth plus Postgres)
- **Hosting:** Netlify, auto-deploy from GitHub
- **DNS:** Netlify DNS
- **Repo:** KeiterandCo org, `groundwork`

### Data model

**profiles** (extends Supabase auth.users)
- id (uuid, references auth.users)
- name (text)
- created_at (timestamp)

**log_entries**
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- created_at (timestamp)
- session_date (date)
- project_name (text)
- model_used (text)
- session_type (text)
- what_got_stuck (text)
- blocker_categories (text array)
- what_id_do_differently (text)
- tools_used (text array)
- outcome (text)
- notes (text, nullable)

Row-level security: users can only read and write their own rows.

### Key patterns
- Astro islands for interactive components (log form, analysis charts, filter UI)
- Supabase JS client for auth and data
- No SSR needed for logged-in views, client-side data fetching is fine
- Analysis view uses client-side aggregation over the user's full log history

---

## Visual design direction

Dark, utilitarian, builder-tool aesthetic. Not a marketing site, not a dashboard for executives. Something that feels at home next to a code editor.

- Dark background (near-black, not pure black)
- Tight typography, monospace accents for data and tags
- Single bright accent color (consider a sharp chartreuse, electric teal, or amber, not the standard blues or purples)
- Subtle grid or noise texture on backgrounds
- Data-dense but not cluttered
- Minimal decoration, maximum information clarity

---

## Accessibility

WCAG 2.2 AA on every view. Semantic HTML, keyboard navigable, all form fields labeled, color contrast checked on all combinations including dark backgrounds with accent text.

---

## Definition of done

- [ ] All copy standards met (no em dashes, no AI language, voice matches builder tone)
- [ ] WCAG 2.2 AA accessibility pass completed
- [ ] Color contrast checked on all text-on-background combinations
- [ ] Keyboard navigable throughout
- [ ] All form fields labeled with clear validation
- [ ] Responsive confirmed at 768px and 1280px (desktop primary, tablet acceptable)
- [ ] Font loading handled (preload, font-display: swap, fallback stack)
- [ ] Auth working: signup, login, session persistence, logout
- [ ] Row-level security confirmed: users see only their own entries
- [ ] Log entry form saves correctly to Supabase
- [ ] Full log view loads, filters, and sorts correctly
- [ ] Analysis view surfaces recurring blockers, project breakdown, model breakdown, stall radar, lesson bank
- [ ] Review layer shows monthly summary and copy button
- [ ] 404 page present and branded
- [ ] Print stylesheet present
- [ ] Landing page has headline, subheadline, CTA, non-flat background
- [ ] BUILDNOTES.md written
- [ ] CLAUDE.md present in repo root
