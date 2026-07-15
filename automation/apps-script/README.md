# DFLB content automation — setup

The owner edits a Google **Sheet** (dates + schedule) and a Google **Drive folder**
(the flyer). A Google **Apps Script** bound to the Sheet reads both natively and
commits the regenerated site files to GitHub; a GitHub Action publishes them.
No Google Cloud, no service account, no paid tiers — total cost $0.

Two ways to do the one-time setup:

- **Fastest:** paste [`claude-in-chrome-setup.md`](./claude-in-chrome-setup.md)
  into Claude-in-Chrome (logged into your Google + GitHub) and let it build the
  artifacts for you.
- **By hand:** follow the steps below (~15 min).

---

## 1. Google Sheet

Create a Sheet named **DFLB Site Content** with two tabs.

**Tab "Sale Info"** — labels in column A, values in column B:

| A | B |
|---|---|
| Sale name | Fall 2026 Sale |
| Sale start date | 8/15/2026 |
| Sale end date | 8/17/2026 |
| Countdown to | 8/15/2026 10:00:00 |
| Location name | Jewish Community Center (JCC) |
| Address | 1200 Edgewood Ave, Rochester, NY 14618 |

Apply **Data → Data validation → "is valid date"** to the three date cells (B2–B4).

**Tab "Schedule"** — header row `Date | Time | Event | Details | Tag`, one row per event:

| Date | Time | Event | Details | Tag |
|---|---|---|---|---|
| 8/12/2026 | | Consignor Registration Closes | Last day to register and pay the fee. | |
| 8/13/2026 | 1 PM – 7 PM | Drop-Off | Bring your tagged items to the JCC. | |
| 8/14/2026 | 9 AM – 4 PM | Drop-Off | Final drop-off window for consignors. | |
| 8/14/2026 | 5 – 8 PM | VIP Pre-Sale | Volunteering consignors shop first. | |
| 8/15/2026 | 9 – 10 AM | Military & Diaper Early Access | Military ID or a new pack of diapers shops first. | |
| 8/15/2026 | 10 AM – 6 PM | Public Shopping | Doors open to the public. 50–90% off retail. | Sale Day 1 |
| 8/16/2026 | 10 AM – 6 PM | Public Shopping | Another full day; restocked throughout. | Sale Day 2 |
| 8/17/2026 | 10 AM – 2 PM | Half-Price Shopping | Marked items are 50% off. | Sale Day 3 · 50% Off |
| 8/17/2026 | 6 – 7:30 PM SHARP | Consignor Pickup | Uncollected items are donated. | |

Data validation: column **Date** = "is valid date"; column **Tag** = dropdown of
`Sale Day 1, Sale Day 2, Sale Day 3, 50% Off, VIP, Early Access`.

Note the **Sheet ID** — the long string in the URL between `/d/` and `/edit`.

## 2. Drive folder

Create a folder named **DFLB Flyer**. Put exactly **one** flyer file in it
(PDF, JPG, or PNG). To change the flyer later: drop the new file in, delete the old.
Note the **folder ID** — the string after `/folders/` in the URL.

## 3. GitHub token

GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate:
- Repository access: only **maxcpost/dudsforlovebugs**
- Permissions → Repository → **Contents: Read and write**

Copy the token (it is shown once). Treat it like a password.

## 4. Apps Script

In the Sheet: **Extensions → Apps Script**. Create two script files and paste the
current code from this repo:
- `render.gs` ← contents of `automation/apps-script/render.js`
- `main.gs` ← contents of `automation/apps-script/main.js`

Then **Project Settings (gear) → Script properties**, add:

| Property | Value |
|---|---|
| GITHUB_REPO | maxcpost/dudsforlovebugs |
| GITHUB_BRANCH | main |
| SHEET_ID | (from step 1) |
| DRIVE_FOLDER_ID | (from step 2) |
| GITHUB_TOKEN | (from step 3) |

## 5. First run + triggers

Run the `run` function once. Google will prompt to authorize Sheets, Drive, and
external requests — approve. Confirm a commit appears on `main` and the site
updates within a minute.

Then **Triggers** (clock icon): add a **Time-driven → Hourly** trigger for `run`,
and optionally an **On-edit** trigger for `run` (near-instant updates when the
owner saves the Sheet).

## Safety notes

- If the Sheet is unreachable or the start/end dates are blank, the run skips —
  the live site is never wiped to empty.
- Unchanged content produces no commit (no hourly noise).
- Keep exactly one file in the flyer folder; if there are two, the newest wins.
