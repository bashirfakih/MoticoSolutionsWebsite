# Motico Solutions — Landing Page Mockup

Premium industrial abrasives & tools distributor website mockup.
Built with Next.js 15, Tailwind CSS v4, Lucide React.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles, animations, scrollbar
│   ├── layout.tsx        # Root layout, meta tags, scroll progress
│   └── page.tsx          # Main homepage (all 9 sections)
└── components/
    └── ui/
        ├── RevealOnScroll.tsx   # Scroll-triggered entrance animation
        ├── CountUp.tsx          # Animated number counter
        ├── CustomCursor.tsx     # Red custom cursor (desktop)
        └── ScrollProgress.tsx  # Top scroll progress bar
```

## Sections

1. **Navbar** — Sticky two-row nav (top bar with social icons + main nav)
2. **Hero** — Full viewport with 3D tilt card and animated headline
3. **Brand Marquee** — Infinite scrolling brand strip
4. **Stats Counter** — Animated numbers on scroll
5. **Product Categories** — Magazine-style asymmetric grid
6. **Why Motico** — Sticky left column + scrollspy feature cards
7. **Trusted Brands** — Hover-reveal brand grid
8. **CTA** — Dark section with glowing rings
9. **Footer** — Full dark footer with newsletter

## Contact Info (Client-Provided)

- Phone: +961 3 741 565
- Email: info@moticosolutions.com
- Location: Beirut, Lebanon

## Deploy to Vercel

```bash
npx vercel
```
