# Groundwork Decision Log

## What problem this solves

Olivia builds constantly across multiple contexts: client sites, internal tools, personal projects, experiments that start and stop. She has good per-project documentation (VERSIONS.md, GAPS.md, decision logs, handoff notes) but no way to see across all of it. She can't answer basic questions about her own process: what's actually causing blockers, whether the same issues keep showing up, which prompt patterns are costing her time. All the signal exists. There's no system to aggregate it.

Groundwork is a lightweight internal logger for builders. You log notable sessions as they happen (end of a build session, end of a conversation, any time something is worth capturing). Over time the analysis layer surfaces patterns you'd miss in any single project.

Built first for Olivia, scoped to work for any builder.

---

## Options considered

**Option 1: Extend the Keiter and Co dashboard**
Pros: already live, Supabase already connected, single place for everything.
Cons: tightly coupled to Keiter and Co infrastructure, not portable, harder to dog-food as a standalone product, adds complexity to an already growing tool.
Decision: no. Build standalone, dashboard integration is a future tab.

**Option 2: Local markdown log with a script to analyze it**
Pros: dead simple, no infrastructure.
Cons: no UI, hard to review patterns visually, not shareable, no analysis layer.
Decision: no. The analysis and visualization layer is the point of building this.

**Option 3: Standalone web app, Supabase backend**
Pros: real UI, real data, portable, can be shared or expanded later, Supabase already familiar.
Cons: slightly more infrastructure than a markdown file, but nothing significant given existing setup.
Decision: yes. This is the build.

---

## Key decisions

**Multi-user from day one**
Decision: build with auth and multi-user support from the start, not just for Olivia.
Alternative: build Olivia-only, no auth, add later.
Why: adding auth after the fact is painful and often breaks data models. The marginal cost of doing it right in v1 is low. If this ever becomes something other builders use, the foundation is already there.

**Log entry is tied to a session or conversation, not a phase or build milestone**
Decision: one log entry equals one notable session. The trigger is flexible. User decides when something is worth capturing.
Alternative: force entries to align with build phases or milestones.
Why: Olivia often has multiple conversations running at once across different aspects of a build. Forcing milestone alignment would create friction and missed entries. Flexible trigger, consistent structure.

**Manual input for v1**
Decision: manual log entry form only. No conversation history ingestion.
Alternative: integrate with Claude conversation history or GitHub commit history.
Why: conversation history integration is technically complex and untested. Build the manual layer first, prove it works, add integrations later when the data model is validated.

**Full analysis layer in v1**
Decision: capture plus analysis plus review layer all ship in v1.
Alternative: capture only in v1, analysis in v2.
Why: the analysis layer is the reason to build this. A logger with no surfacing mechanism is just a journal. The whole value is in seeing patterns across time.

**Astro, Tailwind, Supabase, Netlify**
Decision: standard Keiter and Co stack.
Alternative: React SPA with a different backend.
Why: Olivia knows this stack cold, deployment is automated, Supabase is already in use. No reason to introduce new tooling for an internal tool.

**Dark, utilitarian aesthetic**
Decision: builder tool visual identity, not a marketing site. Dark theme, dense information, functional first.
Alternative: match Keiter and Co brand palette.
Why: this is a tool for builders sitting in VSCode. It should feel at home in that context. Light and airy would be wrong for the use case.

---

## Explicit constraints for v1

- No conversation history ingestion. Manual entry only.
- No public sharing or team features beyond basic multi-user auth.
- No mobile-optimized layout (builder tool, desktop primary).
- No AI-generated analysis in v1. Pattern surfacing is query-based, not LLM-powered.
- No integrations with GitHub, Netlify, or Claude in v1.

---

## V2 and beyond signals

- Claude conversation history ingestion (pull patterns from actual build conversations)
- GitHub commit message ingestion (correlate log entries with what actually shipped)
- LLM-powered synthesis (monthly summary generated from log data)
- Public export or share of your pattern report
- Dashboard integration as a tab in dashboard.keiterandco.com
- Mobile view if usage patterns suggest it

---

## Open questions at spec time

- What categories of blocker types should be available as tags? Needs a short list to seed the UI. Olivia should define these from her own build history.
- What does the "review layer" look like exactly? A generated summary, a filtered view, a printable report? Needs definition before the kickoff.
- Row-level security in Supabase: each user sees only their own entries, or is there a shared/team view option in v1?
