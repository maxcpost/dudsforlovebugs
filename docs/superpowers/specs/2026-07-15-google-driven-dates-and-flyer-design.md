# Google-Driven Dates, Schedule & Flyer — Design Spec

**Date:** 2026-07-15
**Status:** Approved design, pending implementation plan
**Repo:** dudsforlovebugs (static site, GitHub Pages)

## Problem

The site's sale dates, the day-by-day schedule, and the downloadable flyer are
currently hardcoded across many files and all three design versions (Safe,
Bold, Bold 2). The business owner (non-technical) needs to update these herself
without touching code — edit dates/schedule in one place, and swap the flyer by
dropping a new file in a folder.

## Goals

- The owner edits **one Google Sheet** to control all dates and the full
  day-by-day schedule.
- The owner swaps the flyer by **dropping a file into one Google Drive folder**
  (drop new in, delete old — that simple).
- Changes appear on the live site automatically within ~1 hour.
- Dates/schedule are **baked into the static HTML** (not fetched live in the
  browser) so Google Search, the countdown, and structured data stay correct
  and pages stay fast.
- All three versions (Safe / Bold / Bold 2) show the same Google-sourced data.

## Non-Goals

- Real-time (sub-minute) updates. ~Hourly is acceptable.
- Making non-date content (copy, images other than the flyer) Sheet-editable.
- Changing the contact form, hosting, or the visual designs.

## Approach

A scheduled **GitHub Action** runs ~hourly (and on a manual "Run now" trigger).
Each run:

1. Authenticates as a read-only **Google service account**.
2. Reads the **Sheet** → a normalized `content.json`.
3. Finds the **newest file** in the **Drive folder** → downloads it as the flyer.
4. Injects the data into the **managed regions** of every page in all three
   versions, writes the countdown target, and updates the flyer download links.
5. Commits changes to `main` and publishes to the live GitHub Pages site.

Baking into HTML (vs. a browser-side fetch) is the deliberate choice: it keeps
the dates in real HTML for SEO/structured data, avoids a runtime dependency on
Google, and needs no public data endpoints.

## Data Sources (owner-facing)

### Google Sheet — two tabs

**Tab 1 "Sale Info"** — label → value pairs:

| Setting | Value | Field type |
|---|---|---|
| Sale name | Fall 2026 Sale | text |
| Sale start date | Aug 15, 2026 | date picker |
| Sale end date | Aug 17, 2026 | date picker |
| Countdown to | Aug 15, 2026 10:00 AM | date picker + time |
| Location name | Jewish Community Center (JCC) | text |
| Address | 1200 Edgewood Ave, Rochester, NY 14618 | text |

The site auto-formats the human date range ("August 15–17, 2026") from
start/end (handles same-month and cross-month ranges), sets the countdown from
"Countdown to", and fills the JSON-LD Event start/end.

**Tab 2 "Schedule"** — one row per event (site groups rows by date into day cards):

| Date | Time | Event | Details | Tag |
|---|---|---|---|---|
| Aug 12 | | Consignor Registration Closes | Last day to register and pay the fee. | |
| Aug 13 | 1 PM – 7 PM | Drop-Off | Bring your tagged items to the JCC. | |
| Aug 15 | 10 AM – 6 PM | Public Shopping | Doors open to the public. 50–90% off. | Sale Day 1 |
| Aug 17 | 10 AM – 2 PM | Half-Price Shopping | Marked items are 50% off. | Sale Day 3 · 50% Off |

**Structured input (prevents bad data at the source):**
- All `Date` cells and the `Countdown to` cell use Google Sheets **date-picker**
  data validation.
- The `Tag` column is a **dropdown** of preset badge options (e.g. Sale Day 1/2/3,
  50% Off, VIP, or blank).
- `Time`, `Event`, `Details` are free text.

### Google Drive folder — the flyer

- Contains exactly one flyer file (PDF, JPG, or PNG).
- Owner's workflow: drop the new flyer in, delete the old one.
- Convention: if more than one file is present, the **newest wins** (logged).

### Ownership / access

- Built in the developer's Google account now; the site reads via the service
  account, so **ownership is irrelevant to function**. The owner can later be
  added as Editor (or ownership transferred where Google allows) with no change
  to the pipeline.

## Authentication

- A Google Cloud **service account** (read-only) with the Sheets and Drive APIs
  enabled. Its JSON key is stored as a GitHub Actions **secret**.
- The owner shares the Sheet and the flyer folder with the service account's
  email (like adding any collaborator). No public/published data.
- One-time ~15-minute setup, done by the developer with a short runbook.

## Components

1. **`scripts/fetch-content.mjs`** — authenticates; reads the Sheet into a
   normalized `content.json`; finds the newest file in the Drive folder and
   downloads it to `new-site/images/flyer.<ext>`.
   Depends on: `googleapis`, the service-account key.

2. **`scripts/apply-content.mjs`** — reads `content.json` and rewrites only the
   **managed regions** in every version's HTML; writes the countdown target;
   updates flyer download links. Pure transform (no network), so it is testable
   and supports `--dry-run` (prints the diff, writes nothing).
   Depends on: the marker convention below.

3. **`.github/workflows/refresh-content.yml`** — schedule (~hourly) + manual
   trigger. Runs fetch → apply → commit to `main` → publish to GitHub Pages.
   Depends on: the secret, repo write permission.

`content.json` is the seam between fetch (network) and apply (pure transform),
so apply can be developed and tested against a fixed fixture.

## Managed Regions (templating)

Date/schedule/flyer spots are wrapped in HTML-comment markers that `apply`
overwrites in place; everything outside the markers is untouched, preserving the
hand-authored designs. Markers (in each of Safe / Bold / Bold 2 as applicable):

- `<!-- dflb:sale-dates -->…<!-- /dflb:sale-dates -->` — hero date line.
- `<!-- dflb:next-sale -->…<!-- /dflb:next-sale -->` — "Next Sale" CTA block.
- `<!-- dflb:schedule -->…<!-- /dflb:schedule -->` — schedule-page timeline.
- `<!-- dflb:event-jsonld -->…<!-- /dflb:event-jsonld -->` — JSON-LD Event.

The countdown target moves out of hardcoded `js/countdown.js` into a generated
`new-site/js/sale-date.js` (e.g. `window.DFLB_SALE_TARGET = "…"`), which
`countdown.js` reads. `apply` regenerates that file.

## Deploy

The workflow: fetch → apply → `git commit` to `main` → run the existing publish
step (equivalent of `publish-preview.sh`, adapted for CI) to update the
`gh-pages` live site. Runs on schedule and on manual dispatch. No changes with
nothing to commit produce no deploy.

## Error Handling (intentionally light)

Structured Sheet fields make malformed data unlikely, so validation is minimal.
The single guard: **never wipe the site to empty.**

- Sheet unreadable / Google unreachable → skip the run, keep the live site.
- Core dates (start/end) blank → skip the run, keep the live site.
- Flyer folder empty → keep the current flyer.
- Otherwise → publish what's in the Sheet as-is.

No per-field validation, no abort-on-typo messaging beyond the above.

## Testing

- `apply --dry-run` against a fixture `content.json` — confirm the managed
  regions render correctly in all three versions.
- `fetch` run locally against the real service account + Sheet — confirm parsing.
- Render the generated pages (local server + browser) before enabling the
  hourly schedule; leave the schedule off until a manual run looks right.

## One-Time Setup (developer, guided)

1. Create a free Google Cloud project; enable Sheets API + Drive API.
2. Create a service account; download its JSON key.
3. Add the key as a GitHub Actions secret.
4. Create the Sheet (two tabs, with data validation) and the Drive folder from
   templates; share both (read-only) with the service-account email.
5. Do a manual workflow run; verify; then enable the hourly schedule.

## Open Items

- Confirm final preset list for the `Tag` dropdown.
- Confirm flyer download filename shown to visitors (e.g. `dflb-flyer.pdf`).
- Node runtime + `googleapis` assumed for the scripts (revisit if a lighter
  dependency is preferred).
