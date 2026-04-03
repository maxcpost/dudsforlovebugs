# Duds for Love Bugs — New Website Options

**Prepared for Natalie Chandler | April 2026**

---

## What We're Doing

Your current website runs on WordPress and is hosted on GoDaddy. We're rebuilding it from scratch as a faster, simpler, cheaper site. The new site will look better, load faster, and show up better in Google searches.

Before we build, we need to decide **how the site will work behind the scenes**. The big question is: **how will you make updates** (like changing sale dates or uploading a new flyer) without needing to call a developer every time?

We've narrowed it down to two good options. Both are free to host — the only cost is your domain name (~$10/year through Namecheap).

---

## What the Site Needs to Do

Here's everything the new site needs to handle:

| Need | How It Works |
|------|-------------|
| **~10 informational pages** | About the sale, how to consign, how to volunteer, vendor info, etc. |
| **Event dates & schedule** | Sale dates, drop-off times, VIP pre-sale times — these change each season |
| **Downloadable flyers** | Visitors can download/print a flyer for the upcoming sale |
| **Contact form** | A "Get in Touch" form that sends you an email when someone fills it out |
| **MySaleManager links** | Buttons that send visitors to MySaleManager for registration, item entry, volunteer signup, etc. (these stay exactly as they are) |
| **Photo gallery** | Pictures from past sales |
| **Social media links** | Links to your Facebook and Instagram |
| **Google-friendly SEO** | Proper page titles, descriptions, and structured data so the site ranks well |

**The content that changes most often:**
- Next sale dates and times
- Drop-off and pickup schedule
- Volunteer shift information
- New flyers each season

Everything else (how consigning works, what you can sell, tagging instructions, vendor agreement) changes rarely or never.

---

## Option A: "The Professional CMS"

**Hugo + Sveltia CMS + Netlify**

### How It Works (Plain English)

Your website files live on **GitHub** (think of it as a secure online filing cabinet for the website's code and content). When you want to update something — like changing the next sale date — you go to a **private admin page** on your own website (something like `dudsforlovebugs.com/admin`). There, you see a simple editing screen with labeled fields like "Sale Date," "Location," and "Drop-off Times." You type in the new info, hit **Save**, and the website automatically rebuilds itself with the changes in about 30 seconds.

The technology that makes this work:

- **Hugo** — A tool that takes your content and turns it into a fast, clean website. It runs automatically in the background when you save changes. You never interact with it directly.
- **Sveltia CMS** — The admin editing screen you'd actually use. It's free, runs right in your web browser, and is designed for people who aren't developers. It shows you labeled form fields, not code.
- **Netlify** — The company that hosts (stores and serves) your website for free. When you save a change in the admin screen, Netlify automatically rebuilds the site and makes it live.

### What Editing Looks Like for You

1. Go to `dudsforlovebugs.com/admin` in your browser
2. Log in (one-time setup with a free GitHub account)
3. Click the page you want to edit (e.g., "Schedule")
4. Change the text in the labeled fields (e.g., "Fall Sale Date: October 18-20, 2026")
5. Click **Save** (or **Publish**)
6. Wait ~30 seconds — your site is updated

You can also upload new flyer images, add gallery photos, and edit any text on any page through this same admin screen.

### What It Costs

| Item | Cost |
|------|------|
| Domain name (Namecheap) | ~$10/year |
| Website hosting (Netlify free plan) | $0 |
| Admin editing tool (Sveltia CMS) | $0 |
| Contact form (Web3Forms or FormSubmit) | $0 |
| **Total** | **~$10/year** |

### The Fine Print

**Netlify's free plan gives you 300 "credits" per month.** Credits are used when:
- The site rebuilds after you make a change (15 credits per update)
- People visit the site (10 credits per gigabyte of traffic)
- Someone submits the contact form through Netlify Forms (1 credit each)

For a small site like yours — maybe 5 updates per month and a few hundred visitors — you'd use roughly 100-150 credits out of 300. That's plenty of breathing room.

To be safe, **we'd use an external contact form service** (Web3Forms or FormSubmit — both free) instead of Netlify's built-in forms. This keeps your credit budget entirely for hosting and updates.

**You will need a free GitHub account.** This is your login for the admin screen. GitHub is a trusted, widely-used platform (owned by Microsoft). Setting up an account takes about 2 minutes.

### Pros

- You can edit **any content on any page** — text, dates, images, flyers, gallery photos
- The admin screen has labeled fields, not code — it's designed for non-developers
- The site is extremely fast (pre-built HTML, served from a global network)
- Full version history — if you accidentally delete something, we can always get it back
- Proper 301 redirects from old URLs (important for keeping your Google ranking)
- Built-in contact form spam protection

### Cons

- Initial setup is more involved (that's our job, not yours)
- You need to create and remember a GitHub login
- There's a short learning curve for the admin screen (we'd walk you through it)
- If you somehow use all 300 Netlify credits in a month, the site goes offline until the next month (extremely unlikely for your traffic level, but worth knowing)

---

## Option B: "The Google Sheets Approach"

**Hand-Coded HTML + Google Sheets + GitHub Pages**

### How It Works (Plain English)

The website is built as a set of hand-coded web pages hosted for free on **GitHub Pages**. The parts of the site that change often — sale dates, schedule, event details — are pulled from a **Google Sheet** that you control. When you update the spreadsheet, the website automatically shows the new information the next time someone visits.

Think of it this way: the website is like a poster on a wall, but certain parts of the poster (the dates, times, and locations) are written on sticky notes that come from your spreadsheet. Change the sticky note (the spreadsheet), and the poster updates.

The technology:

- **HTML/CSS/JavaScript** — The standard building blocks of every website. We hand-code these to make the site look great and load fast.
- **Google Sheets** — A spreadsheet you already know how to use. Certain columns map to certain parts of the website (e.g., Column A = Event Name, Column B = Date, Column C = Location).
- **Google Sheets API** — A free service from Google that lets the website read your spreadsheet data. Visitors never see the spreadsheet — they just see the nicely formatted website.
- **GitHub Pages** — A free hosting service from GitHub. Your website files are stored in a GitHub repository, and GitHub serves them to visitors.

### What Editing Looks Like for You

1. Open the Google Sheet (bookmarked in your browser, or pinned in Google Drive)
2. Find the row you want to change (e.g., "Fall 2026 Sale")
3. Type the new date, time, or location in the appropriate column
4. Close the spreadsheet — that's it

The website picks up the changes automatically within a few seconds. No saving, no publishing, no waiting.

**For things that DON'T change often** (like the "What Can I Sell?" page or the tagging instructions), those are baked into the website code. To change those, you'd ask us to make the edit — it would take a few minutes.

**For uploading new flyers**, you'd send us the file and we'd add it to the site. (Alternatively, we could set up a Google Drive folder where you drop flyers, and the site links to them — but the Google Sheets approach works best for text-based content, not file management.)

### What It Costs

| Item | Cost |
|------|------|
| Domain name (Namecheap) | ~$10/year |
| Website hosting (GitHub Pages) | $0 |
| Google Sheets (data source) | $0 |
| Google Sheets API (reads data) | $0 |
| Contact form (Web3Forms or FormSubmit) | $0 |
| **Total** | **~$10/year** |

### The Fine Print

**The Google Sheets API is free** with very generous limits (300 reads per minute — your site would use maybe 5-10 per minute even on a busy day).

**A free API key is required** to connect the website to your spreadsheet. We set this up once during development. The key is restricted to only work from your website's domain, so it can't be misused.

**Your Google Sheet must be set to "Anyone with the link can view."** The data in the sheet (sale dates, times, locations) is already public information on your website, so this is not a privacy concern. No one can edit the sheet — only view it.

**GitHub Pages does not support true 301 redirects.** We use a widely-accepted workaround (instant meta-refresh redirects) that Google treats identically to 301 redirects for search ranking purposes. Your SEO will be preserved.

**Contact form uses an external service.** We'd use **Web3Forms** (250 free submissions/month) or **FormSubmit** (unlimited free submissions). Both send you an email notification when someone fills out the form, and both have built-in spam protection.

### Pros

- **Editing is a Google Sheet** — nothing new to learn, no logins to remember
- Changes appear on the site within seconds
- The site is extremely fast (static HTML)
- Free hosting with generous limits (100 GB bandwidth/month, far more than you'd ever use)
- No credit system to worry about — no risk of the site going offline
- Google Sheets is backed by Google — it's not going anywhere

### Cons

- You can only edit the **data fields** we set up in the spreadsheet (dates, times, locations, event names). You **cannot** change page layouts, add new pages, update the "What Can I Sell?" list, or upload flyers yourself — those require a developer
- There's a brief flicker when the page loads while it fetches data from the spreadsheet (usually under 1 second, but noticeable on slow connections)
- Slightly worse for SEO: search engines see the page before the spreadsheet data loads, so dynamic content may not be fully indexed (though for event dates this is a minor concern)
- If the Google Sheet is accidentally deleted or sharing settings are changed, the dynamic parts of the site will show an error until it's fixed
- New flyer uploads require developer assistance (or a Google Drive workaround)

---

## Side-by-Side Comparison

| Feature | Option A (CMS) | Option B (Google Sheets) |
|---------|---------------|------------------------|
| **Monthly cost** | $0 | $0 |
| **Edit sale dates yourself?** | Yes | Yes |
| **Edit any page text yourself?** | Yes | No — developer needed |
| **Upload flyers yourself?** | Yes | No — developer needed |
| **Add gallery photos yourself?** | Yes | No — developer needed |
| **Editing tool** | Website admin screen | Google Sheets |
| **New login required?** | Yes (free GitHub account) | No (your existing Google account) |
| **Learning curve** | Small (admin screen walkthrough) | None (it's a spreadsheet) |
| **How fast are updates?** | ~30 seconds | Instant |
| **Risk of site going offline** | Very low (credit limit exists but unlikely to hit) | Very low (only if Google Sheet is deleted) |
| **SEO quality** | Excellent (proper 301 redirects, all content in HTML) | Very good (meta-refresh redirects, dynamic content may not be fully indexed) |
| **Developer needed for routine updates?** | No | Sometimes (for anything beyond dates/schedule) |
| **Long-term independence** | High — you can manage everything | Medium — you need a developer for structural changes |

---

## Our Recommendation

**If you want full control** over updating your own site — changing any text, uploading flyers, adding photos — **choose Option A**. The tradeoff is a small learning curve with the admin screen, but once you're comfortable, you won't need to contact a developer for routine updates.

**If you want zero learning curve** and your updates are mostly just changing dates and times — **choose Option B**. The tradeoff is that anything beyond date/schedule changes requires developer help.

Both options produce a fast, professional, Google-friendly website at the same cost (~$10/year for the domain). The difference is really about how much you want to be able to do yourself.

---

## Questions?

Take your time reviewing these options. We're happy to walk through either one in more detail, show you examples of what the editing experience looks like, or answer any questions before you decide.
