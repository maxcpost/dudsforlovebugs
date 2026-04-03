# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

You are an expert frontend developer and web designer building a production website. Write correct, semantic, accessible HTML with Tailwind CSS. Produce distinctive, polished designs that avoid generic "AI slop" aesthetics. Every design decision must be intentional.

## Project Overview

Rebuilding **dudsforlovebugs.com** — a children's consignment sale business in Rochester, NY run by Natalie Chandler. The current site is WordPress on GoDaddy; the new site will be hand-coded and hosted on GitHub Pages or Netlify (pending client decision).

### Directory Structure

- `/old-site/` — Archive of the current WordPress site (content, SEO audit, asset inventory)
- `/new-site/` — The rebuilt site (code lives here)
- `/design-toolkit.md` — Full design reference (colors, fonts, icons, image strategy, copy framework, SEO templates)
- `/tech-stack-options.md` — Architecture options document for the client

### Key Reference Files

Before building any page, read:
- `old-site/content/*.md` — Original page content for each page
- `old-site/seo-audit.md` — SEO baseline and per-page canonical URLs
- `old-site/url-redirect-map.md` — Required 301 redirects
- `old-site/external-links.md` — All MySaleManager and third-party URLs
- `design-toolkit.md` — Design system, copy framework, and technical specs

## Key Constraints

- **MySaleManager stays as-is.** All MySaleManager links (`mysalemanager.net/...?partnercode=DFLB`) are external and must be preserved exactly. Do not attempt to replicate or modify this integration.
- **SEO preservation is critical.** URL slugs must match the old site (or have 301 redirects). See `old-site/seo-audit.md` for per-page canonical URLs.
- **No WordPress, no CMS at the code level.** This is a static site. All SEO features (structured data, sitemaps, meta tags) are implemented in HTML.
- **The site is informational.** Its purpose is to tell visitors about the consignment sale and how to get started as a consignor, shopper, volunteer, or vendor.

## External Services (Do Not Replace)

| Service | Purpose | URL Pattern |
|---------|---------|-------------|
| MySaleManager | Consignor login, registration, drop-off scheduling, item entry, volunteer signup, mailing list | `mysalemanager.net/...?partnercode=DFLB` |
| Google Forms | VIP/Valet application | `forms.gle/rv3MY1PFxXJtELih8` |
| PayPal | Vendor fee payment | `paypal.me/dudsforlovebugs/` |
| Facebook | Social presence | `facebook.com/dudsforlovebugs` |
| Instagram | Social presence | `instagram.com/dudsforlovebugs` |
| Web3Forms or FormSubmit | Contact form submissions | TBD |

## Contact Info

- General email: dudsforlovebugs@gmail.com
- VIP consignor email: vipconsignor@gmail.com
- Location: Jewish Community Center (JCC), 1200 Edgewood Ave, Rochester, NY 14618

---

## Design System

### CSS Framework
- **Tailwind CSS v4** — utility-first, with a build step (`npx @tailwindcss/cli`)
- Use utility classes directly. Avoid `@apply` except for repeated base patterns.
- Mobile-first responsive design: design for small screens, layer up with `sm:`, `md:`, `lg:`.

### Typography
- **Headings:** Nunito (700, 800) — rounded, friendly, approachable
- **Body:** Open Sans (400, 600) — universally readable
- Load via Google Fonts with `rel="preconnect"` and `font-display: swap`
- Use `rem`/`em` for font sizes, never `px`

### Color Direction
- Warm, family-friendly palette (coral/peach primary, sage/teal secondary, cream background, dark charcoal text, golden yellow accent)
- All colors defined as CSS custom properties for theming
- MUST pass WCAG AA contrast: 4.5:1 for body text, 3:1 for large text and UI components

### Icons
- **Lucide Icons** (inline SVG, `stroke="currentColor"`) for UI icons
- **Font Awesome Free** only for brand logos (Facebook, Instagram, PayPal)

### Images
- Use `<picture>` element: AVIF > WebP > JPEG fallback
- Hero/LCP image: `fetchpriority="high"`, NO lazy loading
- All below-fold images: `loading="lazy"` + `decoding="async"`
- Always set explicit `width` and `height` attributes
- Target: hero < 150 KB, content < 80 KB, thumbnails < 30 KB

### Animations
- **AOS v2.3.4** for scroll-triggered entrance animations (`data-aos="fade-up"`)
- Custom CSS transitions for hover micro-interactions (transform + box-shadow)
- Respect `prefers-reduced-motion` — disable animations when user prefers reduced motion

---

## Accessibility (WCAG 2.2 Level AA — Non-Negotiable)

These are hard requirements, not suggestions:

1. `lang="en"` on `<html>`
2. Skip-to-main-content link as the first focusable element on every page
3. Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`
4. One `<h1>` per page. Heading hierarchy never skips levels (h1 > h2 > h3).
5. All `<img>` have descriptive `alt` text. Decorative images use `alt=""`
6. Color contrast: 4.5:1 body text, 3:1 large text, 3:1 UI components
7. All form `<input>` elements have associated `<label>` with matching `for`/`id`
8. No "click here" or "read more" link text. Links must be descriptive.
9. Visible keyboard focus indicators (2px+ outline, 3:1 contrast)
10. Logical tab order (never use `tabindex` > 0)
11. All interactive elements are keyboard accessible
12. `font-display: swap` on all web fonts
13. ARIA: use semantic HTML first. Only add ARIA when native HTML is insufficient.

---

## SEO Requirements

### Every Page Must Include
1. `<title>` — format: `Page Name | Duds for Love Bugs` (50-60 chars, front-load keywords)
2. `<meta name="description">` — 140-160 chars, include location + value prop + CTA
3. `<link rel="canonical">` pointing to its own URL
4. JSON-LD structured data (see schemas below)
5. Open Graph tags: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:site_name`
6. Twitter card tags: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
7. `sitemap.xml` at root
8. `robots.txt` referencing sitemap

### JSON-LD Schemas Per Page
- **Every page:** WebSite, WebPage, BreadcrumbList
- **Homepage:** + Organization, LocalBusiness
- **Schedule page:** + Event (one per upcoming sale)
- **Contact page:** + LocalBusiness (with full address + geo coordinates)

### Local SEO
- Include "Rochester, NY" in title tags and H1s where natural
- NAP (Name, Address, Phone) must be identical everywhere it appears
- Use exact format: "Duds for Love Bugs" / "1200 Edgewood Ave, Rochester, NY 14618"

### 301 Redirects Required
| Old URL | New URL |
|---------|---------|
| `/consign-2/` | `/consign/` |
| `/contact-us-01/` | `/contact/` |
| `/full-schedul/` | `/schedule/` |
| `/view-full-schedule/` | `/schedule/` |
| `/event-directory/` | `/schedule/` |
| `/printable-flyers/` | `/schedule/` |

---

## Performance Targets (Core Web Vitals)

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| INP (Interaction to Next Paint) | ≤ 200ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |

- Preload hero/LCP image with `fetchpriority="high"`
- Preconnect to Google Fonts and form service origins
- All scripts use `defer` attribute
- Minify CSS and HTML for production

---

## Copywriting Guidelines

### Framework: StoryBrand
- The **customer is the hero** (parents/families). **DFLB is the guide**.
- Lead with benefits, not features. Show the transformation.
- Every page answers: What do you offer? How does it make my life better? What do I do next?

### Style Rules
- Simple over complex ("use" not "utilize")
- Specific over vague ("earn 65-75% of your sale price" not "earn money")
- Active over passive
- No exclamation points in body copy
- Mirror customer language, not corporate jargon

### CTA Patterns
- Primary: present-tense action verb + specific outcome ("Register to Consign", "Shop the Sale")
- Transitional: lower-commitment ("Join Our Mailing List", "See the Schedule")
- Repeat CTAs after every major section
- Use contrasting button color for primary CTAs

---

## Site Map

```
dudsforlovebugs.com/
├── /                      Homepage
├── /consign/              How to consign (hub)
├── /registration/         Registration details + MySaleManager link
├── /what-can-i-sell/      Accepted items list
├── /tagging-merchandise/  Tagging instructions
├── /vip-tagging/          VIP/Valet tagging service
├── /purple-play-rack/     PPR discounted tier
├── /volunteering/         Volunteer benefits + signup
├── /donate/               Crisis Nursery partnership
├── /vendors/              Vendor info + agreement
├── /schedule/             Event dates + downloadable flyer
├── /gallery/              Event photos
├── /contact/              Contact form + map + info
├── /sitemap.xml
└── /robots.txt
```

---

## Navigation Structure

5-7 items, audience-segmented: **Shop | Consign | Volunteer | Schedule | About | Contact**

The consign dropdown (or sub-pages) should cover: Registration, What Can I Sell, Tagging, VIP Tagging, Purple Play Rack.

---

## NEVER Do These Things

1. Never use generic fonts (Inter, Roboto, Arial, system-ui) — use the specified Nunito + Open Sans pairing
2. Never use purple gradients on white backgrounds or other cliched "AI-generated" aesthetics
3. Never lazy-load the hero/LCP image
4. Never skip heading levels
5. Never use color alone to convey information
6. Never use "click here" or "read more" as link text
7. Never hardcode colors — use CSS custom properties
8. Never write `tabindex` > 0
9. Never omit `width`/`height` on images
10. Never use `px` for font sizes — use `rem`/`em`
