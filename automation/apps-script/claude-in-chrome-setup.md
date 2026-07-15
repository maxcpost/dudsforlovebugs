# Claude-in-Chrome setup prompt

Paste everything in the box below into **Claude in Chrome**, in a browser where
you are already logged into **the Google account** that will own the Sheet/folder
**and your GitHub account**. Claude will build the Sheet, the Drive folder, and
the Apps Script for you, pausing at the one sensitive step (the GitHub token).

> Heads-up: browser automation of the Apps Script editor and Script Properties
> can be fiddly. Watch it work and be ready to nudge it. Do **not** let it type
> your GitHub token — you'll paste that yourself.

---

```
I'm logged into my Google account and my GitHub account in this browser. Help me
set up a content automation for my website (a static site in the GitHub repo
maxcpost/dudsforlovebugs). Do the steps below in order. After each artifact,
show me its URL and the ID I'll need. PAUSE and ask me before the GitHub-token
step — I'll enter that secret myself.

PART 1 — Google Sheet
1. Open sheets.new to create a new spreadsheet; rename it "DFLB Site Content".
2. Rename the first tab to "Sale Info". Fill column A (labels) and column B
   (values):
     A1 Sale start date      B1 8/15/2026
     A2 Sale end date        B2 8/17/2026
     A3 Countdown to         B3 8/15/2026 10:00:00
     A4 Location name        B4 Jewish Community Center (JCC)
   Then select B1:B3 and apply Data > Data validation > Criteria: "is valid date".
3. Add a second tab named "Schedule". Put this header in row 1:
     A1 Date | B1 Time | C1 Event | D1 Details | E1 Tag
   Add these rows (2 onward):
     8/12/2026 |            | Consignor Registration Closes | Last day to register and pay the fee. |
     8/13/2026 | 1 PM – 7 PM | Drop-Off | Bring your tagged items to the JCC. |
     8/14/2026 | 9 AM – 4 PM | Drop-Off | Final drop-off window for consignors. |
     8/14/2026 | 5 – 8 PM   | VIP Pre-Sale | Volunteering consignors shop first. |
     8/15/2026 | 9 – 10 AM  | Military & Diaper Early Access | Military ID or a new pack of diapers shops first. |
     8/15/2026 | 10 AM – 6 PM | Public Shopping | Doors open to the public. 50–90% off retail. | Sale Day 1
     8/16/2026 | 10 AM – 6 PM | Public Shopping | Another full day; restocked throughout. | Sale Day 2
     8/17/2026 | 10 AM – 2 PM | Half-Price Shopping | Marked items are 50% off. | Sale Day 3 · 50% Off
     8/17/2026 | 6 – 7:30 PM SHARP | Consignor Pickup | Uncollected items are donated. |
   Apply "is valid date" validation to column A (A2:A100). Apply a dropdown to
   column E (E2:E100) with items: Sale Day 1, Sale Day 2, Sale Day 3, 50% Off,
   VIP, Early Access.
4. Give me the Sheet's ID (the long string in the URL between /d/ and /edit).

PART 2 — Drive folder
5. Open drive.google.com and create a folder named "DFLB Flyer". If I gave you a
   flyer file, upload it; otherwise leave it empty for now.
6. Give me the folder's ID (the string after /folders/ in its URL).

PART 3 — Apps Script
7. Back in the Sheet, open Extensions > Apps Script.
8. In the default Code.gs file, delete any placeholder and paste the FULL raw
   contents of:
   https://raw.githubusercontent.com/maxcpost/dudsforlovebugs/main/automation/apps-script/render.js
9. Add a new script file named "main" and paste the FULL raw contents of:
   https://raw.githubusercontent.com/maxcpost/dudsforlovebugs/main/automation/apps-script/main.js
10. Open Project Settings (the gear icon) > Script properties, and add these
    properties (leave GITHUB_TOKEN for last):
      GITHUB_REPO     = maxcpost/dudsforlovebugs
      GITHUB_BRANCH   = main
      SHEET_ID        = (from step 4)
      DRIVE_FOLDER_ID = (from step 6)
    Then STOP and tell me you're ready for the GitHub token. I will add the
    GITHUB_TOKEN property value myself — do not type or ask for the token.
11. After I've added the token: back in the editor, select the run function and
    click Run. When Google prompts for authorization, tell me which permissions
    it's asking for so I can approve (Sheets, Drive, and external requests).
12. Once run succeeds, open Triggers (the clock icon) and add:
      - a Time-driven trigger for "run", Hour timer, every hour;
      - (optional) an On-edit trigger for "run".

Show me each URL/ID as you go, and confirm at the end that a commit landed on the
maxcpost/dudsforlovebugs main branch.
```

---

After it finishes, edit any date in the Sheet and confirm the live site updates
within the hour (or within a minute, if you added the on-edit trigger).
