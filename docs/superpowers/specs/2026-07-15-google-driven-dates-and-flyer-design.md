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
- Changes appear on the live site automatically (hourly, or on-edit).
- Dates/schedule are **baked into the static HTML** (not fetched live in the
  browser) so Google Search, the countdown, and structured data stay correct
  and pages stay fast.
- All three versions (Safe / Bold / Bold 2) show the same Google-sourced data.
- **$0 ongoing cost.**

## Non-Goals

- Real-time (sub-second) updates.
- Making non-date content (copy, images other than the flyer) Sheet-editable.
- Changing the contact form, hosting, or the visual designs.

## Approach — a Google Apps Script bound to the Sheet

A single **Google Apps Script**, bound to the Sheet, is the engine. It runs on
its own **time-driven trigger (~hourly)** and/or an **on-edit trigger**
(near-instant after the owner edits). Each run:

1. Reads the **Sheet** natively (`SpreadsheetApp`) → a normalized content object.
2. Finds the **newest file** in the **Drive folder** natively (`DriveApp`).
3. Rewrites the **managed regions** of every page in all three versions,
   regenerates the countdown target, and updates the flyer.
4. **Commits** the changed files to the GitHub repo via the GitHub REST API
   (`UrlFetchApp` + a repo-scoped token). The commit triggers GitHub Pages to
   republish.

### Why Apps Script (not a GitHub Action + service account)

- Apps Script runs **inside Google**, bound to the Sheet, so it reads the Sheet
  and Drive folder **natively** — no Google Cloud project, no service account,
  no API keys.
- Apps Script has its **own scheduler** (hourly trigger; optional on-edit
  trigger) — no GitHub Actions needed.
- The **only** external dependency is a single GitHub token used to commit the
  regenerated files (the site's files live in the repo, which is what Pages
  serves — so the edits must be written there).

Baking into HTML (vs. a browser-side fetch) is the deliberate choice: it keeps
the dates in real HTML for SEO/structured data, avoids a runtime dependency on
Google, and needs no public data endpoints.

## Cost

$0 ongoing. GitHub Pages (public repo), Google Apps Script (triggers,
`UrlFetchApp`, `SpreadsheetApp`, `DriveApp`), and the GitHub API are all free at
this scale. No paid services, no Google Cloud billing.

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

- Built in the developer's Google account now. The Apps Script runs as whoever
  owns the Sheet, with native access — so the owner can later be added as an
  Editor (or ownership transferred where Google allows) with no change to the
  automation.

## Authentication

- **Reading Google:** native. The bound Apps Script accesses the Sheet
  (`SpreadsheetApp`) and Drive folder (`DriveApp`) directly — no service
  account, no API key.
- **Writing to GitHub:** a **fine-grained GitHub personal access token**,
  scoped to this one repo with Contents: write, stored in the script's **Script
  Properties**. This is the only secret.

## Components

1. **The Apps Script** (bound to the Sheet). Organized into clear functions:
   - `readContent()` — read both tabs → a normalized content object.
   - `readFlyer()` — find the newest file in the Drive folder → bytes + type.
   - `renderRegions(content)` — pure transform: produce the new HTML for each
     managed region + the countdown value (no I/O, unit-testable).
   - `commitToGitHub(files)` — write changed files via the GitHub API in one
     commit.
   - `run()` — orchestrates read → render → commit; wired to the triggers.
   `renderRegions` is deliberately pure so it can be tested against fixed input.

2. **A repo copy of the script** (e.g. `automation/apps-script/`) for version
   control and review; the live copy is pasted into the Sheet's Apps Script
   project (optionally synced via `clasp`).

3. **The managed-region markers** in the site HTML (see below) — the contract
   between the script and the pages.

## Managed Regions (templating)

Date/schedule/flyer spots are wrapped in HTML-comment markers that the script
overwrites in place; everything outside the markers is untouched, preserving the
hand-authored designs. Markers (in each of Safe / Bold / Bold 2 as applicable):

- `<!-- dflb:sale-dates -->…<!-- /dflb:sale-dates -->` — hero date line.
- `<!-- dflb:next-sale -->…<!-- /dflb:next-sale -->` — "Next Sale" CTA block.
- `<!-- dflb:schedule -->…<!-- /dflb:schedule -->` — schedule-page timeline.
- `<!-- dflb:event-jsonld -->…<!-- /dflb:event-jsonld -->` — JSON-LD Event.

The countdown target moves out of hardcoded `js/countdown.js` into a generated
`new-site/js/sale-date.js` (e.g. `window.DFLB_SALE_TARGET = "…"`), which
`countdown.js` reads. The script regenerates that file.

The flyer is committed to the repo at a stable path (`new-site/images/flyer.<ext>`)
and the "Download Printable Flyer" links point at it.

## Deploy

Committing the regenerated files to the repo triggers **GitHub Pages to
republish** — no separate deploy step. Target the production layout where the
site is served from the repo at the domain root (root-relative links work as-is
on `dudsforlovebugs.com`).

**Wrinkle to reconcile (open item):** the current *preview* is served under a
`/dudsforlovebugs/` subpath via `publish-preview.sh` (which rewrites
root-relative links). A commit-to-publish flow assumes root serving. Options to
settle in the plan: (a) point the automation at the production domain and serve
Pages from `main` directly, or (b) have the script also produce the subpath
build for the preview. Preference: (a), once the custom domain is wired.

## Error Handling (intentionally light)

Structured Sheet fields make malformed data unlikely, so validation is minimal.
The single guard: **never wipe the site to empty.**

- Sheet unreadable / Google error → skip the run, keep the live site.
- Core dates (start/end) blank → skip the run, keep the live site.
- Flyer folder empty → keep the current flyer.
- Otherwise → publish what's in the Sheet as-is.

## Testing

- Test `renderRegions` against a fixed content fixture — confirm the managed
  regions render correctly for all three versions.
- Run the script manually (Apps Script editor) against the real Sheet, committing
  to a **test branch** first; confirm parsing, the flyer download, and the diff.
- Render the generated pages (browser) before enabling the trigger; keep the
  trigger off until a manual run looks right.

## One-Time Setup (developer, guided — no Google Cloud)

1. Create the Sheet (two tabs, with date-picker + dropdown data validation) and
   the Drive folder.
2. Open the Sheet → **Extensions → Apps Script**; paste in the script.
3. Create a fine-grained **GitHub token** (this repo, Contents: write); save it in
   the script's **Script Properties**.
4. Run once manually; authorize the script's access to Sheets/Drive; verify the
   commit + published result on a test branch.
5. Add the **time-driven trigger** (hourly) and/or the **on-edit trigger**.

## Open Items

- Deploy/subpath reconciliation (see Deploy) — resolve in the implementation plan.
- Final preset list for the `Tag` dropdown.
- Flyer download filename shown to visitors (e.g. `dflb-flyer.pdf`).
- Hourly trigger, on-edit trigger, or both.
