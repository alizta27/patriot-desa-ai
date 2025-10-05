# Design Guidelines: Simple Hero Landing Page

## Design Approach
**Selected Framework:** Reference-Based (minimalist/modern approach)
**Primary Inspiration:** Apple's minimalist aesthetic meets Stripe's clean typography
**Key Principle:** Maximum impact through restraint - let typography and space breathe

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 12% 8%
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 65%
- Accent: 210 85% 58% (vibrant blue for CTA)

**Light Mode:**
- Background: 0 0% 98%
- Text Primary: 222 12% 8%
- Text Secondary: 0 0% 35%
- Accent: 210 85% 48%

### B. Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts) - clean, modern sans-serif
- Display: 'Poppins' (via Google Fonts) - impactful headlines

**Scale:**
- Hero Headline: text-6xl to text-8xl, font-bold (Poppins)
- Subheadline: text-xl to text-2xl, font-normal (Inter)
- Body: text-base to text-lg (Inter)

### C. Layout System

**Spacing Units:** Consistent use of Tailwind units: 4, 8, 12, 16, 24
- Container: max-w-7xl mx-auto px-6
- Section padding: py-24 md:py-32
- Element spacing: gap-8 for major groups, gap-4 for related items

### D. Hero Section Components

**Structure:**
- Full viewport hero (min-h-screen) with centered content
- Large background image with subtle gradient overlay
- Headline + Subheading + Single CTA button
- Optional: Trust indicator or simple badge

**Visual Treatment:**
- Image: Soft blur/tint overlay (20% dark gradient from bottom)
- CTA Button: Prominent, high-contrast with backdrop-blur if on image
- Typography: Bold, confident sizing with generous line-height (leading-tight to leading-snug)

**Component Details:**
- Primary Button: Large (px-8 py-4), rounded-lg, accent color with white text
- Text Hierarchy: Clear contrast between headline (bold, large) and supporting text (lighter weight, smaller)

### E. Icons & Assets

**Icons:** Heroicons (via CDN) - use sparingly if needed for decorative elements
**Images:** Single hero background image - abstract/gradient or minimal photography

### Images

**Hero Background Image:**
- Type: Abstract gradient mesh or minimal landscape
- Placement: Full-width background, position center
- Treatment: Subtle dark overlay (bg-gradient-to-b from-transparent to-black/30)
- Purpose: Creates depth without competing with typography

## Animation Guidelines

**Minimal Motion:**
- Fade-in on load: Hero content (opacity + slight translateY)
- Hover: Button subtle scale (scale-105) and shadow increase
- NO scroll animations, parallax, or complex motion

## Accessibility

- Maintain 4.5:1 contrast ratio minimum
- Ensure button is keyboard accessible
- Responsive text sizing (viewport-relative for headline)
- Full dark mode support with consistent element treatment

---

**Implementation Note:** This design emphasizes bold typography and negative space. The single hero section should feel deliberate and confident, not sparse. Every element has breathing room and clear hierarchy.