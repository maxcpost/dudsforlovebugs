The automation code was updated so the Google Sheet now drives the dates/schedule on ALL FIVE site versions (Safe, Bold, Bold 2, Bold 3, Bold 4). Update the script and re-run — do NOT read, change, or ask for the GITHUB_TOKEN value.

1. In the Apps Script editor, open the "main" script file (main.gs). Select ALL of its contents and delete them, then paste the FULL raw contents of this URL in their place, and Save (Cmd/Ctrl+S):
   https://raw.githubusercontent.com/maxcpost/dudsforlovebugs/main/automation/apps-script/main.js

2. Set the function dropdown in the top toolbar to "run", then click Run.

3. Open the execution results (View > Executions, or the "Execution log" panel at the bottom). Quote the log for me verbatim — I want the "GITHUB_TOKEN check: ..." line and whether there's a "Committed <sha>" line or an error. If it errors, paste the full error and stack trace.

4. That's it — no trigger changes needed (the existing hourly/on-edit triggers already call run). Confirm whether a new commit landed on the maxcpost/dudsforlovebugs "main" branch.
