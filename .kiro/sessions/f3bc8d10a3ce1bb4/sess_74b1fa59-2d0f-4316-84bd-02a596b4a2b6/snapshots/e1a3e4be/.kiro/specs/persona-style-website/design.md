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

## Data Models

### P5 Design Tokens (CSS Custom Properties)

```css
:root {
  /* P5 Palette */
  --color-red:   #E61C1C;
  --color-black: #0D0D0D;
  --color-white: #FFFFFF;
  --color-gold:  #F0C040;

  /* Typography */
  --font-heading: 'Oswald', 'Anton', sans-serif;
  --font-body:    system-ui, sans-serif;

  /* Spacing scale */
  --space-xs:  0.5rem;
  --space-sm:  1rem;
  --space-md:  2rem;
  --space-lg:  4rem;
  --space-xl:  8rem;

  /* Animation timing */
  --duration-fast:   200ms;
  --duration-enter:  800ms;
  --duration-hero:   1500ms;
  --ease-out:        cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Skill Data Shape (used to render Stat Bars)

```javascript
/**
 * @typedef {Object} Skill
 * @property {string} label        - Display name, e.g. "JavaScript"
 * @property {number} proficiency  - Integer 0–100 representing percentage width
 * @property {string} category     - Category key, e.g. "Languages" | "Tools" | "Design"
 */
```

### Project Card Data Shape

```javascript
/**
 * @typedef {Object} Project
 * @property {string}   title       - Project title
 * @property {string}   description - ≤30 word description
 * @property {string[]} tags        - Technology names
 * @property {string}   href        - URL to live project or repository
 * @property {string}   linkLabel   - Accessible link text, e.g. "View Source"
 */
```

### Form Field Values Shape

```javascript
/**
 * @typedef {Object} ContactFields
 * @property {string} name    - Sender name (non-empty required)
 * @property {string} email   - Email address (format-validated required)
 * @property {string} message - Message body (non-empty required)
 */
```

---

## CSS Architecture

### Section Divider Pattern

Each section that needs a diagonal bottom edge gets this treatment:

```css
.section--hero::after,
.section--skills::after,
.section--projects::after {
  content: '';
  display: block;
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 80px;
  background: var(--next-section-bg);      /* matches the following section's bg */
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}
```

### Entrance Animation Pattern

All animated elements share two states driven by class toggling:

```css
.animate-ready {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity var(--duration-enter) var(--ease-out),
    transform var(--duration-enter) var(--ease-out);
  transition-delay: var(--stagger, 0ms);
}

.animate-ready.animate-in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .animate-ready {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Stat Bar Animation Pattern

```css
.skill__fill {
  width: 0;
  height: 100%;
  background: var(--color-red);
  transition: width var(--duration-enter) var(--ease-out);
}

.skill.animate-in .skill__fill {
  width: var(--target-width);
}

@media (prefers-reduced-motion: reduce) {
  .skill__fill {
    width: var(--target-width);
    transition: none;
  }
}
```

### Project Card Hover Pattern

```css
.project-card {
  transition:
    box-shadow var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
  border: 2px solid transparent;
}

@media (hover: hover) {
  .project-card:hover {
    box-shadow: 6px 6px 0 var(--color-red);
    border-color: var(--color-gold);
  }
}
```

---

## Error Handling

### Contact Form Validation

`FormValidator.validate()` returns a `ValidationResult`. Errors are keyed by field name:

| Field     | Invalid condition                                    | Error message                          |
|-----------|------------------------------------------------------|----------------------------------------|
| `name`    | Empty string or whitespace only                      | "Name is required."                    |
| `email`   | Empty, or fails `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` test | "Please enter a valid email address."  |
| `message` | Empty string or whitespace only                      | "Message is required."                 |

`displayErrors()` uses `requestAnimationFrame` to guarantee the DOM update runs within one frame (≤16 ms, well within the 100 ms requirement). If all fields are valid, `valid: true` is returned and the form submits normally.

### Intersection Observer Robustness

- The observer is initialized inside a `DOMContentLoaded` listener so it always finds elements in the DOM
- `unobserve(entry.target)` is called immediately after adding `.animate-in` — this is the idempotency guarantee: once unobserved, the element can never re-trigger
- If `IntersectionObserver` is not supported (extremely old browsers), all `.animate-ready` elements fall back to visible state via a feature-detection guard:

```javascript
if (!('IntersectionObserver' in window)) {
  document.querySelectorAll('.animate-ready')
    .forEach(el => el.classList.add('animate-in'));
}
```

### Hamburger Menu State

- `aria-expanded` is always kept in sync with the visual state
- Clicking outside the open menu or pressing Escape closes it
- Focus is trapped inside the open panel on keyboard navigation

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Active nav link tracks the current section

*For any* of the five navigable sections, when that section's content occupies the most visible portion of the viewport during scrolling, the corresponding Nav Bar link element SHALL have the active class (and only that link shall have it).

**Validates: Requirements 2.4**

---

### Property 2: Stat bar animates to its defined proficiency width

*For any* Stat Bar element with a `--target-width` CSS custom property value between 0% and 100%, when the Intersection Observer fires for that element and `.animate-in` is applied, the `.skill__fill` element SHALL transition from `width: 0` to `width: var(--target-width)`. The final rendered width SHALL equal the declared target value (within 1px tolerance).

**Validates: Requirements 5.2**

---

### Property 3: Project card entrance animation triggers exactly once per card

*For any* Project Card element in the projects grid, when that card first enters the viewport and the Intersection Observer fires, the `.animate-in` class SHALL be added to the card. Subsequent scroll passes through the same card SHALL NOT add or re-apply the class or restart any animation.

**Validates: Requirements 6.3, 8.3**

---

### Property 4: Project card hover elevates within 200 ms on pointer devices

*For any* Project Card on a device that supports hover (CSS `hover: hover`), when the pointing device enters the card's bounding box, the computed `box-shadow` and `border-color` values SHALL transition to their elevated states within 200 ms.

**Validates: Requirements 6.4**

---

### Property 5: Contact form rejects any invalid field combination

*For any* triple of input values `(name, email, message)`, the `FormValidator.validate()` function SHALL return `valid: true` if and only if `name.trim()` is non-empty, `email` matches the pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, and `message.trim()` is non-empty. For all other combinations it SHALL return `valid: false` with at least one field error populated.

**Validates: Requirements 7.2**

---

### Property 6: Inline validation errors appear within 100 ms of a failed submission attempt

*For any* form submission attempt that fails validation, `displayErrors()` SHALL update the content of the relevant `aria-live` error spans within 100 ms of the `submit` event firing, with each error message rendered adjacent to its corresponding invalid field.

**Validates: Requirements 7.3**

---

### Property 7: Entrance animations are idempotent — no element re-animates

*For any* element that has already received `.animate-in` (its entrance animation has completed), subsequent Intersection Observer intersection events for that same element SHALL produce no visible change — no class re-addition, no style reset, no animation replay.

**Validates: Requirements 8.3**

---

### Property 8: All animations are suppressed when prefers-reduced-motion is active

*For any* element on the page that would normally receive `.animate-ready` / `.animate-in` entrance animation treatment or a Stat Bar fill transition, when the `prefers-reduced-motion: reduce` media feature is active, that element SHALL be rendered in its final visible state (opacity 1, transform none, full width) with no transition or animation applied.

**Validates: Requirements 8.5**

---

### Property 9: No horizontal overflow across the supported viewport range

*For any* viewport width between 320 px and 2560 px (inclusive), the document body and all section containers SHALL have `scrollWidth` equal to `clientWidth` — i.e., no horizontal scrollbar appears and no content overflows the viewport horizontally.

**Validates: Requirements 9.1**

---

### Property 10: All interactive elements meet minimum touch target size on narrow viewports

*For any* interactive element (Nav Bar links, buttons, Project Card links, form submit button) rendered at a viewport width of 768 px or narrower, the element's bounding box SHALL be at least 44 px wide and 44 px tall as measured by `getBoundingClientRect()`.

**Validates: Requirements 9.3**
