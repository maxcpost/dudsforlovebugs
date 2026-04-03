# SEO Audit — dudsforlovebugs.com (Current WordPress Site)

Audited: 2026-03-25

## Site-Wide Config

- **CMS:** WordPress 6.9.4 / PHP 8.3.30
- **SEO Plugin:** Yoast SEO v27.2
- **Theme:** Airi (LA Studio) with WPBakery page builder
- **DNS:** GoDaddy (ns11/ns12.domaincontrol.com)
- **CDN:** Cloudflare
- **Hosting:** GoDaddy managed WordPress
- **Robots meta (all pages):** `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- **JSON-LD WebSite schema (all pages):** name="Duds for Love Bugs", description="Consignment"

## Critical Issues Found

1. **Meta descriptions: MISSING on ALL pages.** Google auto-generates snippets from content.
2. **og:image: MISSING on ALL pages.** Social shares have no preview image.
3. **og:description: MISSING on 12/13 pages.** Only `/consign/` has one and it's just raw nav link text.
4. **No Google Analytics or Tag Manager detected.**
5. **robots.txt has no sitemap reference.**
6. **Gallery page (`/gallery/`) has a WordPress critical error** — duplicate `<title>` tag showing "WordPress > Error".
7. **Event Directory page (`/event-directory/`) is broken** — shows "There is nothing to show here!" and a missing slider error.
8. **Duplicate content:** `/consign/` and `/consign-2/` are separate self-canonicalizing pages with overlapping content.
9. **No Organization, LocalBusiness, or Event schema** — highly relevant for this type of business.
10. **Site description is just "Consignment"** — too vague for search.
11. **Most pages last modified Feb 2020** — only homepage (Jul 2021) and VIP Tagging (Jul 2024) are more recent.

## Per-Page SEO Data

All pages share: no meta description, no og:image, no og:description (except /consign/), twitter:card = summary_large_image.

| Page | URL | Title | Canonical | Last Modified | Reading Time |
|------|-----|-------|-----------|---------------|--------------|
| Homepage | `/` | HOME - Duds for Love Bugs | `https://dudsforlovebugs.com/` | 2021-07-29 | — |
| Consign | `/consign/` | CONSIGN - Duds for Love Bugs | `https://dudsforlovebugs.com/consign/` | 2020-02-18 | — |
| Consign 2 | `/consign-2/` | consign - Duds for Love Bugs | `https://dudsforlovebugs.com/consign-2/` | 2020-02-28 | — |
| Registration | `/registration/` | REGISTRATION - Duds for Love Bugs | `https://dudsforlovebugs.com/registration/` | 2021-07-28 | 2 min |
| What Can I Sell? | `/what-can-i-sell/` | WHAT CAN I SELL? - Duds for Love Bugs | `https://dudsforlovebugs.com/what-can-i-sell/` | 2020-02-28 | 1 min |
| Tagging Merchandise | `/tagging-merchandise/` | TAGGING MERCHANDISE - Duds for Love Bugs | `https://dudsforlovebugs.com/tagging-merchandise/` | 2020-02-28 | 8 min |
| VIP Tagging | `/vip-tagging/` | VIP TAGGING - Duds for Love Bugs | `https://dudsforlovebugs.com/vip-tagging/` | 2024-07-13 | 2 min |
| Purple Play Rack | `/purple-play-rack-ppr/` | PURPLE PLAY RACK (PPR) - Duds for Love Bugs | `https://dudsforlovebugs.com/purple-play-rack-ppr/` | 2020-02-28 | 1 min |
| Volunteering | `/volunteering/` | VOLUNTEERING - Duds for Love Bugs | `https://dudsforlovebugs.com/volunteering/` | 2020-02-28 | 1 min |
| Donate | `/donate/` | DONATE - Duds for Love Bugs | `https://dudsforlovebugs.com/donate/` | 2020-02-18 | 1 min |
| Vendors | `/vendors/` | VENDORS - Duds for Love Bugs | `https://dudsforlovebugs.com/vendors/` | 2020-02-20 | 4 min |
| Gallery | `/gallery/` | GALLERY - Duds for Love Bugs | `https://dudsforlovebugs.com/gallery/` | 2020-02-18 | — |
| Contact | `/contact-us-01/` | Contact Us 01 - Duds for Love Bugs | `https://dudsforlovebugs.com/contact-us-01/` | 2020-05-19 | 1 min |
| Printable Flyers | `/printable-flyers/` | Printable Flyer - Duds for Love Bugs | `https://dudsforlovebugs.com/printable-flyers/` | — | — |
| Blog | `/blog/` | Blog - Duds for Love Bugs | `https://dudsforlovebugs.com/blog/` | — | — |
| Full Schedule | `/full-schedul/` | FULL SCHEDULE - Duds for Love Bugs | `https://dudsforlovebugs.com/full-schedul/` | — | — |
| View Full Schedule | `/view-full-schedule/` | View Full Schedule - Duds for Love Bugs | `https://dudsforlovebugs.com/view-full-schedule/` | — | — |
| Event Directory | `/event-directory/` | Events - Duds for Love Bugs | `https://dudsforlovebugs.com/event-directory/` | — | — |
| VIP/Valet Application | `/vip-valet-application/` | vip /valet application - Duds for Love Bugs | `https://dudsforlovebugs.com/vip-valet-application/` | — | — |

## Sitemap Structure (Yoast-generated)

- `/sitemap_index.xml` (index)
  - `/post-sitemap.xml` (2 posts)
  - `/page-sitemap.xml` (18 pages)
  - `/la_team_member-sitemap.xml` (custom post type)
  - `/category-sitemap.xml` (1 category: "fashion")
  - `/author-sitemap.xml`

## robots.txt (Current)

```
User-Agent: *
Disallow:
```

No sitemap reference. Wide open.
