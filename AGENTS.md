# Matthew Portfolio (matthew-eae) Repository Agent Instructions

Version: 1.0.0
Status: Active
Canonical owner: tweek (on behalf of Matthew)
Last updated: 2026-07-03

## Workspace Classification

Personal, family project — independent root. Moved out of `Cowork/family/matthew/portfolio/` on 2026-07-02 to `C:\Users\tweek\Projects\matthew-eae\` for the same reason as `tweekcore` — OneDrive's background sync was corrupting git operations on repos nested in the Cowork tree. Do not move this repository back under an OneDrive-synced folder. Treat dev-side material (admin credentials, unpublished draft content) as Personal-confidential per the Cowork boundary map's `family/` classification, even though the deployed site itself is intentionally public once published.

## Purpose

Matthew's personal portfolio website — underwater/RPG-themed, Next.js 14 + Tailwind CSS + Supabase (Auth, Database, Storage), with a public portfolio and an admin CMS dashboard for managing profile, skills, experiences, achievements, testimonials, and projects.

## Audience

AI agents and tweek working in this repository.

## Canonical Sources

This file (`AGENTS.md`) is canonical. `README.md` holds setup/deploy/design-system mechanics, not governance. Platform-specific adapters (e.g. `CLAUDE.md`), if ever added, must stay thin and point here.

## Startup Load Order

1. Read `C:\Users\tweek\Projects\AGENTS.md` for baseline reporting-style and reversibility rules shared across all repos in this dev root.
2. Read this file for repo-specific classification and rules.
3. Read `README.md` for setup, database schema, and design system reference.

## Allowed Data

- App code, Supabase schema, design tokens, deployment notes.
- Matthew's own portfolio content once explicitly provided for publishing.

## Prohibited Data

- Secrets, tokens, keys, or `.env`-style values in any tracked file. `.env.local` is gitignored — verified clean 2026-07-02; `.env.example` is tracked by design (placeholders only).
- Admin login credentials or Supabase service-role key in any tracked file or documentation.
- Unpublished draft content should not be treated as public-facing until explicitly toggled to Published in the CMS.

## Tool Rules

- This repo has its own GitHub remote (`kokanadan/matthew-eae`). Row Level Security in Supabase gates public read access to published content only — do not weaken this without explicit approval.

## Reporting Style & Reversibility

See `C:\Users\tweek\Projects\AGENTS.md` — baseline rules, not repeated here.

## Escalation Conditions

Repo-specific, on top of the baseline in `C:\Users\tweek\Projects\AGENTS.md`:

- Deleting published content.
- Changing admin authentication or Supabase RLS policies.

## Change Log

- 2026-07-03: Expanded from generic stub to repo-specific governance file, matching the `tweekcore` template, as part of the TweekCore/AEDS workspace refactor follow-up.
- 2026-07-03: Removed duplicated Reporting Style / Reversibility text — now points to `C:\Users\tweek\Projects\AGENTS.md`, the shared baseline for all repos in this dev root.

