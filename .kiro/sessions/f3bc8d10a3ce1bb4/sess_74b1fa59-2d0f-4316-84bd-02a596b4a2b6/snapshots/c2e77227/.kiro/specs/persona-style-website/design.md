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

### 3. About Section (`#about`)

**Structure:**
```html
<section id="about" class="section section--about" aria-label="About me">
  <div class="about__inner animate-ready">
    <figure class="about__avatar" aria-hidden="true">
      <img src="assets/images/profile.jpg" alt="Portrait of John Doe"
           class="about__img" width="280" height="280" loading="lazy">
    </figure>
    <div class="about__text">
      <h2 class="section__heading">About</h2>
      <p class="about__bio"><!-- biography text --></p>
    </div>
  </div>
</section>
```

**Behavior:**
- White or light-grey background for visual contrast against dark adjacent sections
- Profile image masked with `clip-path: polygon(...)` for angled P5 frame treatment
- `.animate-ready` → `.animate-in` toggled by `AnimationController` on viewport entry

### 4. Skills Section (`#skills`)

**Structure:**
```html
<section id="skills" class="section section--skills" aria-label="Skills">
  <h2 class="section__heading">Skills</h2>
  <div class="skills__grid">
    <div class="skills__category">
      <h3 class="skills__category-title">Languages</h3>
      <ul class="skills__list" role="list">
        <li class="skill animate-ready">
          <span class="skill__label">JavaScript</span>
          <div class="skill__bar" role="progressbar"
               aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"
               aria-label="JavaScript proficiency: 90%">
            <div class="skill__fill" style="--target-width: 90%"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</section>
```

**Behavior:**
- `.skill__fill` starts at `width: 0`; when `.animate-in` is added, CSS transitions to `var(--target-width)` over 800 ms
- `AnimationController` observes each `.skill` element independently so bars animate in sequence as they enter the viewport
- Single-column stacking at `≤768px`

### 5. Projects Section (`#projects`)

**Structure:**
```html
<section id="projects" class="section section--projects" aria-label="Projects">
  <h2 class="section__heading">Projects</h2>
  <ul class="projects__grid" role="list">
    <li class="project-card animate-ready" style="--stagger: 0ms">
      <h3 class="project-card__title">Project Name</h3>
      <p class="project-card__desc">Short description ≤30 words.</p>
      <ul class="project-card__tags" role="list" aria-label="Technologies used">
        <li class="project-card__tag">TypeScript</li>
      </ul>
      <a class="project-card__link btn btn--outline" href="#"
         target="_blank" rel="noopener noreferrer"
         aria-label="View Project Name on GitHub">View Source</a>
    </li>
  </ul>
</section>
```

**Behavior:**
- CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` — auto-collapses to 1 column on narrow viewports
- Entrance animation: `.animate-ready` (opacity 0, translateY 20px) → `.animate-in`; each card's `--stagger` CSS variable offsets the transition-delay by 100 ms per card
- Hover: `box-shadow` elevation + red/gold `border-color` transition, all within 200 ms via CSS `transition`
- Dark background, white text, red/gold geometric border lines

### 6. Contact Section (`#contact`)

**Structure:**
```html
<section id="contact" class="section section--contact" aria-label="Contact">
  <h2 class="section__heading">Contact</h2>
  <form class="contact__form animate-ready" id="contact-form" novalidate
        aria-label="Contact form">
    <div class="form__group">
      <label class="form__label" for="contact-name">Name</label>
      <input class="form__input" id="contact-name" name="name"
             type="text" autocomplete="name" aria-required="true"
             aria-describedby="contact-name-error">
      <span class="form__error" id="contact-name-error" role="alert"
            aria-live="polite"></span>
    </div>
    <div class="form__group">
      <label class="form__label" for="contact-email">Email</label>
      <input class="form__input" id="contact-email" name="email"
             type="email" autocomplete="email" aria-required="true"
             aria-describedby="contact-email-error">
      <span class="form__error" id="contact-email-error" role="alert"
            aria-live="polite"></span>
    </div>
    <div class="form__group">
      <label class="form__label" for="contact-message">Message</label>
      <textarea class="form__input form__input--textarea"
                id="contact-message" name="message" rows="5"
                aria-required="true"
                aria-describedby="contact-message-error"></textarea>
      <span class="form__error" id="contact-message-error" role="alert"
            aria-live="polite"></span>
    </div>
    <button class="btn btn--primary" type="submit">Send Message</button>
  </form>
</section>
```

**Behavior:**
- `FormValidator` intercepts `submit` event, calls `validate(fields)` which returns field-level errors
- Inline error messages injected into `aria-live` spans within 100 ms; styled red per P5 Palette
- Dark background, gold/red form borders

---

## Interfaces

### `AnimationController`

```javascript
class AnimationController {
  /**
   * @param {string} selector - CSS selector for elements to observe
   * @param {IntersectionObserverInit} options - threshold, rootMargin
   */
  constructor(selector, options = {}) {}

  /** Attach observer to all matching elements */
  init() {}

  /**
   * Called when an element intersects.
   * Adds 'animate-in' class, then unobserves to prevent re-trigger.
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   */
  _onIntersect(entries, observer) {}
}
```

### `NavController`

```javascript
class NavController {
  /**
   * @param {string} navSelector - selector for the nav element
   * @param {string[]} sectionIds - ordered list of section IDs
   */
  constructor(navSelector, sectionIds) {}

  /** Attach scroll listener and hamburger toggle */
  init() {}

  /**
   * Determines which section is most visible and updates active link.
   * @returns {string} active section ID
   */
  _getActiveSection() {}

  /** Toggle hamburger open/closed state and aria-expanded */
  _toggleHamburger() {}
}
```

### `FormValidator`

```javascript
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Object.<string, string>} errors - field name → error message
 */

class FormValidator {
  /**
   * @param {HTMLFormElement} form
   */
  constructor(form) {}

  /**
   * Validates all required fields.
   * @param {Object.<string, string>} values - field name → value
   * @returns {ValidationResult}
   */
  validate(values) {}

  /**
   * Displays inline errors in the form's aria-live spans.
   * Runs within one rAF frame (≤ 16ms, well within 100ms target).
   * @param {Object.<string, string>} errors
   */
  displayErrors(errors) {}

  /** Clears all error messages */
  clearErrors() {}
}
```

---
