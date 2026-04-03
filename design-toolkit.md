# Duds for Love Bugs — Design & Development Toolkit

**Reference document for building the new site. All tools verified as of April 2026.**

---

## CSS Framework

**Primary: Tailwind CSS v4.2.2**
- Utility-first CSS — maximum design control, production output under 10 KB for this site
- Requires a simple build step: `npx @tailwindcss/cli -i input.css -o output.css`
- Cannot use CDN version in production (it's dev-only, 266 KB JS runtime)
- Works with both architecture options (Hugo or plain HTML)

**Why Tailwind over alternatives:**
- Pico CSS (10-13 KB, classless) is simpler but limits layout control for custom designs
- Bootstrap (25 KB CSS + 16 KB JS) is heavier and produces generic-looking sites
- Tailwind produces the smallest CSS bundle and gives pixel-perfect design control

---

## Typography

**Heading font:** Nunito (weights: 700, 800)
**Body font:** Open Sans (weights: 400, 600)

Nunito's rounded terminals = friendly and approachable (perfect for children's brand).
Open Sans = universally readable, excellent weight options.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```

---

## Color Palette — Pastel Kids

**Fun, bright, kid-friendly pastels.** Playful but professional enough for parents.

Each page uses a different pastel gradient hero to create visual variety while staying cohesive.

| Role | Color | Light (backgrounds) | Dark (buttons/hover) |
|------|-------|--------------------|--------------------|
| **Primary** | Soft Coral-Pink `#F0857E` | `#FDE9E6` | `#D4605A` |
| **Secondary** | Pastel Mint `#6FC7A8` | `#DFF5EC` | `#4FA88A` |
| **Accent 1** | Sunny Yellow `#F0C75E` | `#FFF7DC` | — |
| **Accent 2** | Sky Blue `#7CC0E0` | `#E2F2FA` | `#5AA0C0` |
| **Accent 3** | Soft Lavender `#B8A2DA` | `#EDE5F7` | `#9580BE` |
| **Accent 4** | Warm Peach `#F8B898` | `#FDE8DD` | — |
| **Background** | Cream `#FFFBF5` | `#F3ECE2` | — |
| **Text** | Charcoal `#2D2A26` | `#5E5852` (secondary) | — |

### Hero Gradient Assignments
- **Homepage:** peach → sky
- **Registration:** peach → sky
- **What Can I Sell:** sky → mint
- **Tagging:** lavender → peach
- **VIP Tagging:** coral → peach
- **Schedule:** sage/mint
- **Volunteering:** golden → mint
- **Donate:** sage → golden
- **Contact / Gallery / Vendors:** sage

**Must pass:** WCAG AA contrast ratios — 4.5:1 for body text, 3:1 for large text and UI components.

---

## Icons

**Primary: Lucide Icons v1.7.0** (lucide.dev)
- 1,694 icons, consistent stroke style, MIT license
- Copy-paste inline SVG — zero external dependencies, zero HTTP requests
- `stroke="currentColor"` inherits parent text color for easy theming

**Supplementary: Font Awesome Free v6.x**
- Brand/social icons only (Facebook, Instagram, PayPal logos)
- Lucide does not include brand logos

---

## Images

### Format Strategy
1. **AVIF** — best compression, ~93-95% browser support
2. **WebP** — excellent compression, ~97% support
3. **JPEG/PNG** — universal fallback

### Implementation
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" width="1200" height="630" loading="lazy" decoding="async">
</picture>
```

### Rules
- Hero/LCP image: `fetchpriority="high"`, NO lazy loading
- All below-fold images: `loading="lazy"` + `decoding="async"`
- Always include explicit `width` and `height` to prevent CLS
- Target sizes: hero < 150 KB, content < 80 KB, thumbnails < 30 KB

### Tools
- Squoosh (squoosh.app) — browser-based, free, supports AVIF/WebP
- TinyPNG (tinypng.com) — batch compression, up to 20 images at a time

---

## Animations

**Scroll animations: AOS v2.3.4** (Animate on Scroll)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
<script>AOS.init({ duration: 800, easing: 'ease-out', once: true, offset: 100 });</script>
```

Usage: `<div data-aos="fade-up">Content</div>`

**Hover micro-interactions:** Custom CSS transitions (no library needed)
```css
.btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
```

---

## Contact Form

**Primary recommendation: Web3Forms**
- 250 submissions/month free
- Works with static HTML — just set form `action` to their API endpoint
- Email notifications to up to 3 addresses
- Free hCaptcha spam protection
- 30-day submission archive

**Alternative: FormSubmit.co**
- Unlimited submissions, completely free
- reCAPTCHA + honeypot spam protection
- File uploads (5 MB)
- Sustained by sponsorships (less certain long-term reliability)

---

## SEO Toolkit

### Every Page Must Have
1. `<title>` — format: `Page Name | Duds for Love Bugs` (50-60 chars)
2. `<meta name="description">` — 140-160 chars, include location + value prop + CTA
3. `<link rel="canonical">` — self-referencing
4. JSON-LD structured data (see schemas below)
5. Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`)
6. Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

### JSON-LD Schemas Required
- **Every page:** WebSite, WebPage, BreadcrumbList
- **Homepage:** + Organization, LocalBusiness
- **Schedule/Event pages:** + Event (one per sale)
- **Contact page:** + LocalBusiness (with full address/geo)

### OG Image
- Size: 1200 x 630 px
- Format: PNG for graphics, JPEG for photos
- Under 300 KB
- Create one branded template, customize per page if needed

### Local SEO Priorities
1. Claim Google Business Profile
2. NAP consistency everywhere (exact same name/address/phone format)
3. "Rochester, NY" in title tags and H1s
4. Local citations: Google, Apple Maps, Bing Places, Facebook, Yelp
5. Location-specific long-tail keywords

### Testing Tools
- Google Rich Results Test (search.google.com/test/rich-results)
- Schema.org Validator (validator.schema.org)
- OpenGraph Preview (opengraph.xyz)
- Google Search Console (post-launch)

---

## Accessibility (WCAG 2.2 Level AA)

### Non-Negotiable Checklist
- [ ] `lang="en"` on `<html>`
- [ ] Skip-to-main-content link as first focusable element
- [ ] All images have descriptive `alt` text (decorative = `alt=""`)
- [ ] Color contrast: 4.5:1 body text, 3:1 large text, 3:1 UI components
- [ ] All form inputs have `<label>` with matching `for`/`id`
- [ ] No "click here" link text — descriptive labels only
- [ ] Visible keyboard focus indicators (2px+ border, 3:1 contrast)
- [ ] Semantic HTML throughout (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`)
- [ ] Font sizes in `rem`/`em`, not `px`
- [ ] Tab order is logical (no `tabindex` > 0)
- [ ] `font-display: swap` on all web fonts

### Testing Tools
- WAVE browser extension (webaim.org/wave)
- axe DevTools browser extension
- Lighthouse (Chrome DevTools)
- Manual: tab through every page, test at 200% zoom

---

## Performance / Core Web Vitals Targets

| Metric | Target | How |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | ≤ 2.5s | Preload hero image, use WebP/AVIF, no lazy-load on LCP element |
| INP (Interaction to Next Paint) | ≤ 200ms | Minimal JS, defer all non-critical scripts |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Explicit width/height on all images, font-display: swap |

### Performance Checklist
- [ ] Preconnect to external origins (Google Fonts, form service)
- [ ] Preload hero/LCP image with `fetchpriority="high"`
- [ ] All scripts use `defer` attribute
- [ ] Images use `<picture>` with AVIF > WebP > JPEG fallback
- [ ] CSS is minified for production
- [ ] HTML is minified for production

---

## Copywriting Framework: StoryBrand

### The Formula
1. **Hero** (the customer) wants something → Parents want affordable quality kids' stuff
2. **Problem** → Kids outgrow clothes fast; closets overflow; budgets stretch thin
3. **Guide** (DFLB) shows empathy + authority → "We're parents too. Rochester's favorite sale for X years."
4. **Plan** → 3 simple steps (Register > Tag > Earn / Browse > Shop > Save)
5. **Call to Action** → Direct: "Register to Consign" / Transitional: "Join Our Mailing List"
6. **Failure avoided** → Wasted money, unused clothes piling up
7. **Success achieved** → Closets cleared, money earned, happy kids in great clothes

### Homepage Section Order (StoryBrand)
1. Hero: headline + subheadline + primary CTA
2. Value stack: 3 outcomes in ≤4 words each
3. The stakes: the problem you solve
4. Three pathways: Consign / Shop / Volunteer cards
5. The guide: empathy + authority (testimonials, stats)
6. The plan: 3-step visual process
7. Explanatory paragraph: problem → solution → success
8. Social proof: testimonials, event photos
9. CTA: mailing list signup + next sale date
10. Footer: nav, contact, social links

### CTA Best Practices
- Present-tense action verbs: "Register Now", "Shop the Sale"
- Contrasting button color
- Two types per page: Direct ("Register") + Transitional ("Join Mailing List")
- Repeat CTAs after every major section

---

## Competitive Intelligence: What the Best Consignment Sale Sites Do

Based on analysis of 10 competitor sites (JBF, Rhea Lana's, Got Kids?, PolkaTot, etc.):

### Navigation Pattern
5-7 items, explicitly audience-segmented: **Shop | Consign | Volunteer | Schedule | About | Contact**

### Homepage Pattern
1. Full-width hero with next sale dates (biggest text on page)
2. Three-column cards for the three audiences (Shop / Sell / Volunteer)
3. Social proof section (stats, testimonials, event photos)
4. Mailing list signup
5. Charitable mission / community impact

### Key Conversion Tactics
- Lead with earnings for consignors ("Earn 65-75%")
- Lead with savings for shoppers ("Save 50-90% off retail")
- Lead with early shopping access for volunteers
- Quantify inventory ("80,000+ items from 600+ families")
- Repeat registration CTAs 3-4+ times per page
- Separate paths for new vs. returning consignors
- Announce registration open dates to create urgency
- Sustainability messaging resonates with modern parents

### Full Event Lifecycle Display
Not just shopping dates — show the entire timeline:
- Registration opens → Drop-off appointments → VIP presale → Public sale → Half-price day → Pickup deadline → Payment date

---

## Site Map (Final)

```
dudsforlovebugs.com/
├── / ...................... Homepage (hero, 3 pathways, about, CTA)
├── /consign/ ............. How to consign (hub page)
├── /registration/ ........ Registration details + MySaleManager link
├── /what-can-i-sell/ ..... Accepted items list
├── /tagging-merchandise/ . Tagging instructions
├── /vip-tagging/ ......... VIP/Valet tagging service
├── /purple-play-rack/ .... PPR discounted tier rules
├── /volunteering/ ........ Volunteer benefits + signup
├── /donate/ .............. Crisis Nursery partnership
├── /vendors/ ............. Vendor info + agreement
├── /schedule/ ............ Event dates + downloadable flyer
├── /gallery/ ............. Event photos
├── /contact/ ............. Contact form + map + info
├── /sitemap.xml
└── /robots.txt
```

**301 Redirects needed:**
- `/consign-2/` → `/consign/`
- `/contact-us-01/` → `/contact/`
- `/full-schedul/` → `/schedule/`
- `/view-full-schedule/` → `/schedule/`
- `/event-directory/` → `/schedule/`
- `/printable-flyers/` → `/schedule/`
