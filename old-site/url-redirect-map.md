# URL Redirect Map

When the new site launches, these redirects ensure no SEO equity is lost.

## Pages to Keep (Same Slug)

These URLs should work identically on the new site:

| Old URL | New URL | Notes |
|---------|---------|-------|
| `/` | `/` | Homepage |
| `/registration/` | `/registration/` | Keep |
| `/what-can-i-sell/` | `/what-can-i-sell/` | Keep |
| `/tagging-merchandise/` | `/tagging-merchandise/` | Keep |
| `/vip-tagging/` | `/vip-tagging/` | Keep |
| `/purple-play-rack-ppr/` | `/purple-play-rack-ppr/` | Keep |
| `/volunteering/` | `/volunteering/` | Keep |
| `/donate/` | `/donate/` | Keep |
| `/vendors/` | `/vendors/` | Keep |
| `/gallery/` | `/gallery/` | Keep |

## Pages to Redirect (301)

These slugs are messy on the old site. Redirect old → clean:

| Old URL | New URL | Reason |
|---------|---------|--------|
| `/consign/` | `/consign/` | Keep this one as the canonical |
| `/consign-2/` | `/consign/` | 301 redirect — duplicate page |
| `/contact-us-01/` | `/contact/` | 301 redirect — clean up "01" suffix |
| `/full-schedul/` | `/schedule/` | 301 redirect — fix typo |
| `/view-full-schedule/` | `/schedule/` | 301 redirect — consolidate |
| `/event-directory/` | `/schedule/` | 301 redirect — page was broken, consolidate |
| `/vip-valet-application/` | `/vip-tagging/` | 301 redirect — fold into VIP page or keep separate |
| `/printable-flyers/` | `/flyer/` | 301 redirect (optional, could keep) |

## Pages to Evaluate

| Old URL | Decision Needed |
|---------|----------------|
| `/blog/` | Only 1 post from 2020. Consider dropping or folding into homepage. |
| `/5-consignor-inventory-input-special/` | Blog post linked in footer. Low value — redirect to `/` or drop. |

## How to Implement Redirects

**GitHub Pages:** No server-side redirects. Use `<meta http-equiv="refresh">` in small HTML files at the old paths, or use a custom 404.html with JS routing.

**Namecheap / Any server:** Use `.htaccess` (Apache) or equivalent for proper 301 redirects.
