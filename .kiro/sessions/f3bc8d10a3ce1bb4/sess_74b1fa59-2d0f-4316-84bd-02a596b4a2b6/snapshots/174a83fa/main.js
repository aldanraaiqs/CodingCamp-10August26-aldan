/**
 * main.js — Persona 5-Style Portfolio
 * ES6 module entry point.
 *
 * Contains three controller classes:
 *   - NavController      : active-section tracking & hamburger toggle
 *   - AnimationController: Intersection Observer scroll animations
 *   - FormValidator      : contact form field validation
 */

// ============================================================
// NavController
// ============================================================

class NavController {
  /**
   * @param {string}   navSelector  - CSS selector for the <nav> wrapper element
   * @param {string[]} sectionIds   - Ordered list of section IDs to track
   */
  constructor(navSelector, sectionIds) {
    /** @type {Element|null} */
    this._nav = document.querySelector(navSelector);
    /** @type {string[]} */
    this._sectionIds = sectionIds;
    /** @type {boolean} */
    this._hamburgerOpen = false;
    /** @type {number|null} */
    this._rafId = null;
  }

  /**
   * Attach scroll listener (rAF-throttled) and hamburger click listener.
   */
  init() {
    // TODO: implement in task 3.3
  }

  /**
   * Determines which section is most visible and updates the active nav link.
   * @returns {string} The ID of the currently active section.
   */
  _getActiveSection() {
    // TODO: implement in task 3.3
    return '';
  }

  /**
   * Toggle the hamburger menu open/closed state and sync aria-expanded.
   */
  _toggleHamburger() {
    // TODO: implement in task 3.3
  }
}

// ============================================================
// AnimationController
// ============================================================

class AnimationController {
  /**
   * @param {string}                   selector - CSS selector for elements to observe
   * @param {IntersectionObserverInit} options  - IntersectionObserver config
   */
  constructor(selector, options = {}) {
    /** @type {string} */
    this._selector = selector;
    /** @type {IntersectionObserverInit} */
    this._options = options;
    /** @type {IntersectionObserver|null} */
    this._observer = null;
  }

  /**
   * Query all matching elements and begin observing them.
   */
  init() {
    // TODO: implement in task 11.1
  }

  /**
   * Intersection Observer callback.
   * Adds 'animate-in' to intersecting elements, then unobserves each.
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver}        observer
   */
  _onIntersect(entries, observer) {
    // TODO: implement in task 11.1
  }
}

// ============================================================
// FormValidator
// ============================================================

class FormValidator {
  /**
   * @param {HTMLFormElement} form
   */
  constructor(form) {
    /** @type {HTMLFormElement} */
    this._form = form;
  }

  /**
   * Validate all required fields.
   * @param {{ name: string, email: string, message: string }} values
   * @returns {{ valid: boolean, errors: Object.<string, string> }}
   */
  validate(values) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.name || !values.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!values.email || !emailPattern.test(values.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!values.message || !values.message.trim()) {
      errors.message = 'Message is required.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Inject inline error messages into the form's aria-live spans.
   * Runs inside a requestAnimationFrame for guaranteed ≤16 ms DOM update.
   * @param {Object.<string, string>} errors - field name → error message
   */
  displayErrors(errors) {
    requestAnimationFrame(() => {
      for (const [field, message] of Object.entries(errors)) {
        const errorSpan = this._form.querySelector(`#contact-${field}-error`);
        if (errorSpan) {
          errorSpan.textContent = message;
        }
      }
    });
  }

  /**
   * Clear all inline error messages.
   */
  clearErrors() {
    const errorSpans = this._form.querySelectorAll('[role="alert"]');
    errorSpans.forEach(span => {
      span.textContent = '';
    });
  }
}

// ============================================================
// Initialisation — runs after DOM is ready
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Nav
  const nav = new NavController('.nav nav', [
    'hero', 'about', 'skills', 'projects', 'contact',
  ]);
  nav.init();

  // Scroll-triggered entrance animations
  const animator = new AnimationController('.animate-ready', {
    threshold: 0.15,
  });
  animator.init();

  // Contact form validation
  const form = document.getElementById('contact-form');
  if (form) {
    const validator = new FormValidator(form);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      validator.clearErrors();

      const values = {
        name:    form.elements['name'].value,
        email:   form.elements['email'].value,
        message: form.elements['message'].value,
      };

      const result = validator.validate(values);
      if (!result.valid) {
        validator.displayErrors(result.errors);
        return;
      }

      // TODO: handle valid form submission (e.g., fetch POST or mailto fallback)
    });
  }
});

// ============================================================
// Exports (for unit / property tests)
// ============================================================

export { NavController, AnimationController, FormValidator };
