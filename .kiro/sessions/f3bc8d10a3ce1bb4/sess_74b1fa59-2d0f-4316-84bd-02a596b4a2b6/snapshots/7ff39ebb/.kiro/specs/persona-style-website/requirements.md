# Requirements Document

## Introduction

A single-page personal portfolio website inspired by the Persona 5 UI aesthetic. The site uses a red/black/white palette with gold accents, jagged diagonal section dividers, bold sans-serif typography, and geometric card borders to evoke the punk/phantom-thief visual style of the game. The site is built using vanilla HTML, CSS, and JavaScript only — no external frameworks — and must be fully responsive and mobile-friendly.

The page is organized into five scrollable sections: Hero, About, Skills, Projects, and Contact. Moderate JavaScript-driven animations (scroll-triggered entrance effects, hover interactions, smooth scrolling) provide a stylish but non-distracting experience.

---

## Glossary

- **Site**: The single-page personal portfolio website being described in this document.
- **Hero Section**: The topmost full-viewport section containing an animated title reveal and introductory content.
- **About Section**: The section describing the portfolio owner's background and identity.
- **Skills Section**: The section displaying technical and creative skills using P5-style stat bars or cards.
- **Projects Section**: The section displaying a card grid of portfolio projects.
- **Contact Section**: The bottommost section containing a styled contact form or social/email links.
- **Nav Bar**: The sticky top navigation bar styled to resemble a Persona 5 menu bar.
- **P5 Palette**: The primary color scheme — red (`#E61C1C` or similar), black (`#0D0D0D`), white (`#FFFFFF`), and gold (`#F0C040` or similar).
- **Section Divider**: A diagonal or slanted CSS shape separating two adjacent sections.
- **Stat Bar**: A horizontal progress-bar-style element used to visualize skill proficiency, styled after Persona 5 status screens.
- **Project Card**: A rectangular UI card within the Projects grid representing a single portfolio project.
- **Entrance Animation**: A CSS/JS animation triggered by an element entering the viewport via the Intersection Observer API.
- **Vanilla Stack**: HTML, CSS, and JavaScript with no external libraries or frameworks.

---

## Requirements

### Requirement 1 — P5 Visual Identity

**User Story:** As a visitor, I want the site to immediately convey a Persona 5 aesthetic, so that the portfolio feels distinctive and memorable.

#### Acceptance Criteria

1. THE Site SHALL apply the P5 Palette (`#E61C1C` red, `#0D0D0D` black, `#FFFFFF` white, `#F0C040` gold) as the exclusive color scheme across all sections and components.
2. THE Site SHALL use a bold, condensed sans-serif typeface (such as Oswald or Anton, loaded via Google Fonts or self-hosted) for all section headings and the Nav Bar.
3. THE Site SHALL render Section Dividers between each pair of adjacent sections using CSS clip-path or skew transforms to produce diagonal or jagged cuts rather than horizontal lines.
4. THE Site SHALL apply geometric border treatments (sharp corners, offset outlines, or angled accents) to Project Cards and Stat Bars to reinforce the P5 UI language.
5. THE Site SHALL use the Vanilla Stack exclusively — no CSS frameworks (Bootstrap, Tailwind), no JavaScript libraries (jQuery, GSAP, React), and no build tools are permitted.

---

### Requirement 2 — Sticky Navigation Bar

**User Story:** As a visitor, I want a persistent navigation bar that lets me jump to any section at any time, so that I can navigate the single-page layout without scrolling manually.

#### Acceptance Criteria

1. THE Nav Bar SHALL remain fixed to the top of the viewport at all scroll positions.
2. THE Nav Bar SHALL contain labeled links for each of the five sections: Hero, About, Skills, Projects, and Contact.
3. WHEN a Nav Bar link is clicked, THE Site SHALL smoothly scroll the viewport to the corresponding section using CSS `scroll-behavior: smooth` or a JavaScript scroll handler.
4. WHEN a section enters the viewport during scrolling, THE Nav Bar SHALL visually highlight the corresponding link using a red accent or underline to indicate the active section.
5. WHILE the viewport width is 768 px or narrower, THE Nav Bar SHALL collapse the section links into a hamburger menu toggle, revealing a full-width dropdown or slide-in panel on activation.
6. THE Nav Bar SHALL use the P5 Palette — a dark or black background with white or red text — and apply a hover state that changes the link color or adds a red underline accent.

---

### Requirement 3 — Hero Section

**User Story:** As a visitor, I want a visually striking hero that introduces the portfolio owner, so that I immediately understand whose portfolio I am viewing and am compelled to explore further.

#### Acceptance Criteria

1. THE Hero Section SHALL occupy 100% of the initial viewport height (`100vh`).
2. WHEN the page finishes loading, THE Hero Section SHALL animate the portfolio owner's name and title onto the screen using a staggered CSS keyframe reveal (e.g., letters or words fading and sliding in from below or left) completing within 1.5 seconds.
3. THE Hero Section SHALL display a brief tagline or role descriptor (e.g., "Developer / Designer") beneath the animated name.
4. THE Hero Section SHALL include a visually prominent call-to-action element (button or link) styled with a red fill and white text that scrolls to the Projects Section when activated.
5. THE Hero Section SHALL use a black or near-black background with red and gold decorative elements (geometric shapes, diagonal lines, or silhouette graphics) to establish the P5 aesthetic.

---

### Requirement 4 — About Section

**User Story:** As a visitor, I want to read a personal introduction from the portfolio owner, so that I can understand their background, interests, and identity.

#### Acceptance Criteria

1. THE About Section SHALL display a short biographical text block (paragraph or structured list) describing the portfolio owner's background and interests.
2. WHEN the About Section enters the viewport during scrolling, THE About Section SHALL trigger an Entrance Animation that slides or fades its content into view.
3. THE About Section SHALL optionally display a profile image or avatar; WHERE a profile image is present, THE About Section SHALL apply a geometric mask or angled border consistent with the P5 Palette.
4. THE About Section SHALL use a contrasting background color from the adjacent sections (e.g., white or light-grey background with dark text, or an inverted dark panel) to create a clear visual break reinforced by Section Dividers.

---

### Requirement 5 — Skills Section

**User Story:** As a visitor, I want to see the portfolio owner's skills presented clearly, so that I can quickly assess their technical and creative capabilities.

#### Acceptance Criteria

1. THE Skills Section SHALL display each skill as either a Stat Bar (labeled horizontal progress bar) or a styled card, with a visible label and a representation of proficiency level.
2. WHEN a Stat Bar enters the viewport, THE Skills Section SHALL animate the bar from 0% width to the defined proficiency width over a duration between 600 ms and 1000 ms using a CSS transition triggered by the Intersection Observer API.
3. THE Skills Section SHALL group skills into logical categories (e.g., "Languages", "Tools", "Design") with a P5-style category heading for each group.
4. THE Stat Bar fill color SHALL use the primary red (`#E61C1C`) with a gold (`#F0C040`) accent or end cap to match the P5 Palette.
5. WHILE the viewport width is 768 px or narrower, THE Skills Section SHALL stack skill groups and Stat Bars in a single column without horizontal overflow.

---

### Requirement 6 — Projects Section

**User Story:** As a visitor, I want to browse the portfolio owner's projects in a visually organized grid, so that I can quickly identify and explore work that interests me.

#### Acceptance Criteria

1. THE Projects Section SHALL display Project Cards in a responsive CSS Grid layout with a minimum of two columns on viewports wider than 768 px and a single column on narrower viewports.
2. THE Project Card SHALL display at minimum: a project title, a short description (≤ 30 words), a technology tag list, and a link to the live project or source repository.
3. WHEN a Project Card enters the viewport, THE Projects Section SHALL trigger an Entrance Animation (fade-in with upward translate) staggered by 100 ms per card.
4. WHEN the cursor hovers over a Project Card on a pointer device, THE Project Card SHALL elevate visually using a CSS box-shadow change and shift a red or gold border accent into view within 200 ms.
5. THE Project Card SHALL use a dark background with white text, geometric border lines in red or gold, and sharp corners consistent with the P5 UI aesthetic.

---

### Requirement 7 — Contact Section

**User Story:** As a visitor, I want a clear way to reach out to the portfolio owner, so that I can make contact for opportunities or inquiries.

#### Acceptance Criteria

1. THE Contact Section SHALL provide at least one contact method: either a styled HTML form (with name, email, and message fields) or a visible list of social/professional profile links (e.g., GitHub, LinkedIn, email).
2. WHERE a contact form is present, THE Site SHALL validate that the name field is non-empty, the email field matches a standard email format, and the message field is non-empty before submission is permitted.
3. WHERE a contact form is present, IF a field fails validation, THEN THE Contact Section SHALL display an inline error message adjacent to the invalid field within 100 ms of the submission attempt, styled in red consistent with the P5 Palette.
4. THE Contact Section SHALL use a dark background (black or near-black) with the P5 Palette applied to form borders, button fills, and link accents to maintain visual consistency.
5. WHEN the Contact Section enters the viewport, THE Contact Section SHALL trigger an Entrance Animation that fades or slides the form or link list into view.

---

### Requirement 8 — Scroll-Triggered Entrance Animations

**User Story:** As a visitor, I want section content to animate into view as I scroll, so that the experience feels dynamic and purposeful without being distracting.

#### Acceptance Criteria

1. THE Site SHALL use the Intersection Observer API to detect when section content elements enter the viewport, triggering their respective Entrance Animations.
2. THE Site SHALL define an intersection threshold of 15% to 20% (i.e., elements begin animating when at least 15%–20% of the element is visible) to avoid premature triggering.
3. WHEN an element has already completed its Entrance Animation, THE Site SHALL not re-trigger the animation on subsequent scroll passes through the same element.
4. THE Site SHALL limit all Entrance Animation durations to between 400 ms and 900 ms to keep transitions stylish but not distracting.
5. WHERE a user has enabled the `prefers-reduced-motion` media feature, THE Site SHALL disable all Entrance Animations and Stat Bar fill transitions, presenting all content in its final visible state immediately.

---

### Requirement 9 — Responsiveness and Mobile Experience

**User Story:** As a visitor on a mobile device, I want the site to be fully usable and visually consistent with the desktop experience, so that the portfolio is accessible regardless of device.

#### Acceptance Criteria

1. THE Site SHALL be fully navigable and readable on viewport widths from 320 px to 2560 px without horizontal scrolling or content overflow.
2. THE Site SHALL use relative units (rem, em, %, vw/vh) and CSS media queries rather than fixed pixel widths for layout and typography sizing.
3. WHILE the viewport width is 768 px or narrower, THE Site SHALL increase touch target sizes for all interactive elements (Nav Bar links, buttons, Project Card links) to a minimum of 44 × 44 px.
4. THE Site SHALL preserve the P5 visual identity (diagonal Section Dividers, P5 Palette, geometric card borders) at all supported viewport widths.
5. THE Site SHALL achieve a Lighthouse Mobile Performance score of 80 or above and a Lighthouse Accessibility score of 90 or above when measured against the production build.

---

### Requirement 10 — Performance and Code Quality

**User Story:** As a visitor, I want the site to load quickly and run smoothly, so that the animations and interactions feel responsive rather than janky.

#### Acceptance Criteria

1. THE Site SHALL load all above-the-fold content and render the Hero Section within 3 seconds on a simulated 4G connection (10 Mbps down, 40 ms RTT) as measured by Lighthouse.
2. THE Site SHALL keep the total uncompressed JavaScript payload below 50 KB to maintain fast parse and execution times on mobile devices.
3. THE Site SHALL use `will-change: transform` or `will-change: opacity` only on elements that are actively animating to avoid unnecessary GPU layer promotion.
4. WHERE custom fonts are used, THE Site SHALL include `font-display: swap` in the `@font-face` declaration to prevent invisible text during font loading.
5. THE Site SHALL structure HTML with semantic elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<article>`) and include appropriate ARIA labels on interactive elements to support screen reader accessibility.
