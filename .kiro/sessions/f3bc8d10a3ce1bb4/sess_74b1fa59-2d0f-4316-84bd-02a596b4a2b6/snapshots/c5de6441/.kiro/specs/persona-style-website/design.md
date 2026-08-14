# Design Document

## Overview

A single-page personal portfolio website built with the Vanilla Stack (HTML, CSS, JavaScript — no frameworks or build tools). The architecture is a flat file structure: one `index.html`, one `style.css`, one `main.js`, and an optional `assets/` folder for fonts and images. All interactivity is handled by a small JavaScript module organized around three responsibilities: navigation state management, Intersection Observer animation orchestration, and contact form validation.

The visual identity follows the Persona 5 UI language — red/black/white/gold palette, diagonal CSS clip-path section dividers, bold condensed sans-serif headings, and geometric card borders with sharp corners and offset outlines.

---

## Architecture

### File Structure

```
project-root/
├── index.html          # Single HTML document, all five sections
├── style.css           # All styles — layout, palette, animations, responsive rules
├── main.js             # JS module — nav, observers, form validation
└── assets/
    ├── fonts/          # Self-hosted font files (optional)
    └── images/         # Profile image, decorative SVGs (optional)
```

### Module Responsibilities

**`index.html`**
- Semantic structure: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`
- All five sections in DOM order: `#hero`, `#about`, `#skills`, `#projects`, `#contact`
- ARIA attributes on all interactive elements

**`style.css`**
- CSS custom properties for the P5 Palette at `:root` level
- Section dividers via `clip-path` polygon on section `::after` pseudo-elements
- Entrance animation keyframes (`.animate-ready` → `.animate-in` class toggle)
- Responsive breakpoints at `768px` and `480px`
- `@media (prefers-reduced-motion: reduce)` block disabling all transitions/animations

**`main.js`**
- `NavController` — tracks active section, manages hamburger toggle
- `AnimationController` — one `IntersectionObserver` instance for all animated elements
- `FormValidator` — validates contact form fields before submission
- All logic in plain ES6 modules, total uncompressed size target ≤ 50 KB

---

## Components

### 1. Nav Bar (`<header>` / `<nav>`)

**Structure:**
```html
<header class="nav" role="banner">
  <nav aria-label="Main navigation">
    <a class="nav__logo" href="#hero">PORTFOLIO</a>
    <button class="nav__hamburger" aria-expanded="false" aria-controls="nav-links"
            aria-label="Toggle navigation menu">
      <span></span><span></span><span></span>
    </button>
    <ul id="nav-links" class="nav__links" role="list">
      <li><a class="nav__link" href="#hero" data-section="hero">Hero</a></li>
      <!-- ... four more links ... -->
    </ul>
  </nav>
</header>
```

**Behavior:**
- `position: fixed; top: 0; width: 100%; z-index: 100`
- Active link class `.nav__link--active` applied by `NavController` when section crosses viewport midpoint
- Hamburger `aria-expanded` toggles between `"false"` and `"true"` on click; the `nav__links` panel slides down/in
- Hamburger visible only at `≤768px` via `display: none` / `display: flex` media query

### 2. Hero Section (`#hero`)

**Structure:**
```html
<section id="hero" class="section section--hero" aria-label="Hero">
  <div class="hero__content">
    <h1 class="hero__name animate-ready">
      <span class="hero__word" style="--delay: 0ms">JOHN</span>
      <span class="hero__word" style="--delay: 150ms">DOE</span>
    </h1>
    <p class="hero__role animate-ready" style="--delay: 300ms">Developer / Designer</p>
    <a class="hero__cta btn btn--primary" href="#projects"
       aria-label="View my projects">View Projects</a>
  </div>
  <div class="hero__decorations" aria-hidden="true"><!-- SVG geometric shapes --></div>
</section>
```

**Behavior:**
- `100vh` height; black background with red/gold decorative elements
- Name words use CSS `@keyframes heroReveal` — `opacity: 0; transform: translateY(20px)` → `opacity: 1; transform: none`
- Each `<span>` has `animation-delay` from the `--delay` CSS custom property
- Total reveal completes within 1.5 s; triggered on `DOMContentLoaded`
