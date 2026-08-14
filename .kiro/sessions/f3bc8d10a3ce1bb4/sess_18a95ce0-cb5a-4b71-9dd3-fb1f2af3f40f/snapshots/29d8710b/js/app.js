/**
 * app.js — Personal Dashboard
 * Vanilla JavaScript, no frameworks.
 *
 * Features:
 *   - Greeting  : time-based greeting, current date & live clock
 *   - Focus Timer: configurable countdown (default 25 min), start/stop/reset
 *   - To-Do List : add, edit, complete, delete; LocalStorage; duplicate prevention; sort
 *   - Quick Links: add, open, delete; LocalStorage
 *
 * Challenges implemented:
 *   1. Light / Dark mode toggle
 *   2. Custom name in greeting
 *   3. Prevent duplicate tasks
 */

'use strict';

/* ============================================================
   STORAGE HELPERS
   ============================================================ */

const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage quota exceeded — fail silently
    }
  },
};

/* ============================================================
   GREETING MODULE
   Handles: time-based greeting text, live clock, date display,
            custom user name (Challenge 2)
   ============================================================ */

const Greeting = (() => {
  const elTime  = document.getElementById('greeting-time');
  const elName  = document.getElementById('greeting-name');
  const elDate  = document.getElementById('greeting-date');
  const elClock = document.getElementById('greeting-clock');

  // ── name modal elements ──
  const openBtn    = document.getElementById('open-name-modal');
  const overlay    = document.getElementById('name-modal-overlay');
  const nameInput  = document.getElementById('name-input');
  const nameForm   = document.getElementById('name-form');
  const closeBtn   = document.getElementById('close-name-modal');

  let _tickInterval = null;

  /** Return greeting phrase based on current hour. */
  function _getGreetingPhrase(hour) {
    if (hour >= 5  && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }

  /** Format a Date object as e.g. "Wednesday, August 12, 2026". */
  function _formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });
  }

  /** Format a Date object as HH:MM:SS (12-hour). */
  function _formatClock(date) {
    return date.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /** Update all greeting DOM elements. */
  function _tick() {
    const now  = new Date();
    const hour = now.getHours();

    elTime.textContent  = _getGreetingPhrase(hour);
    elDate.textContent  = _formatDate(now);
    elClock.textContent = _formatClock(now);
  }

  /** Render the name — falls back to "There" if not set. */
  function _renderName() {
    const saved = Storage.get('dashboard_name', '');
    elName.textContent = saved.trim() ? saved.trim() : 'There';
  }

  /** Open the name modal and focus the input. */
  function _openModal() {
    const saved = Storage.get('dashboard_name', '');
    nameInput.value = saved;
    overlay.hidden = false;
    nameInput.focus();
  }

  /** Close the name modal. */
  function _closeModal() {
    overlay.hidden = true;
    openBtn.focus();
  }

  /** Save name and close. */
  function _saveName(e) {
    e.preventDefault();
    const value = nameInput.value.trim();
    Storage.set('dashboard_name', value);
    _renderName();
    _closeModal();
  }

  /** Close modal on overlay background click. */
  function _overlayClick(e) {
    if (e.target === overlay) _closeModal();
  }

  /** Close modal on Escape key. */
  function _overlayKeydown(e) {
    if (e.key === 'Escape') _closeModal();
  }

  function init() {
    _renderName();
    _tick();
    _tickInterval = setInterval(_tick, 1000);

    openBtn.addEventListener('click', _openModal);
    closeBtn.addEventListener('click', _closeModal);
    nameForm.addEventListener('submit', _saveName);
    overlay.addEventListener('click', _overlayClick);
    overlay.addEventListener('keydown', _overlayKeydown);
  }

  return { init };
})();

/* ============================================================
   TIMER MODULE
   Handles: configurable countdown, start/stop/reset, blink colon
   ============================================================ */

const Timer = (() => {
  const card       = document.querySelector('.card--timer');
  const elMinutes  = document.getElementById('timer-minutes');
  const elSeconds  = document.getElementById('timer-seconds');
  const elColon    = document.querySelector('.timer__colon');
  const startBtn   = document.getElementById('timer-start');
  const stopBtn    = document.getElementById('timer-stop');
  const resetBtn   = document.getElementById('timer-reset');
  const durationIn = document.getElementById('timer-duration');
  const setBtn     = document.getElementById('timer-set');

  let _totalSeconds  = 25 * 60;
  let _remaining     = _totalSeconds;
  let _intervalId    = null;
  let _isRunning     = false;
  let _colonVisible  = true;

  /** Format seconds as MM:SS. */
  function _format(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return {
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
    };
  }

  /** Update the display. */
  function _render() {
    const { m, s } = _format(_remaining);
    elMinutes.textContent = m;
    elSeconds.textContent = s;
    // Update document title so users can track from other tabs
    document.title = _isRunning ? `${m}:${s} — Dashboard` : 'Dashboard';
  }

  /** Called every second while running. */
  function _tick() {
    // Blink colon
    _colonVisible = !_colonVisible;
    elColon.style.opacity = _colonVisible ? '1' : '0';

    if (_remaining <= 0) {
      _finish();
      return;
    }
    _remaining--;
    _render();
  }

  /** Timer reaches zero. */
  function _finish() {
    _stop();
    card.classList.remove('is-running');
    card.classList.add('is-done');
    elColon.style.opacity = '1';
    document.title = 'Time\'s up! — Dashboard';
    // Simple beep via Web Audio API (no asset file needed)
    _beep();
  }

  /** Play a short beep using Web Audio API. */
  function _beep() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    } catch {
      // Audio not available — fail silently
    }
  }

  function _start() {
    if (_isRunning || _remaining <= 0) return;
    _isRunning = true;
    card.classList.add('is-running');
    card.classList.remove('is-done');
    _intervalId = setInterval(_tick, 1000);
    startBtn.disabled = true;
  }

  function _stop() {
    if (!_isRunning) return;
    _isRunning = false;
    clearInterval(_intervalId);
    _intervalId = null;
    card.classList.remove('is-running');
    elColon.style.opacity = '1';
    startBtn.disabled = false;
    document.title = 'Dashboard';
  }

  function _reset() {
    _stop();
    _remaining = _totalSeconds;
    card.classList.remove('is-done');
    elColon.style.opacity = '1';
    _render();
  }

  /** Apply a custom duration from the input field. */
  function _setDuration() {
    const val = parseInt(durationIn.value, 10);
    if (isNaN(val) || val < 1 || val > 60) {
      durationIn.focus();
      durationIn.select();
      return;
    }
    _stop();
    _totalSeconds = val * 60;
    _remaining    = _totalSeconds;
    card.classList.remove('is-done');
    _render();
  }

  function init() {
    _render();

    startBtn.addEventListener('click', _start);
    stopBtn.addEventListener('click', _stop);
    resetBtn.addEventListener('click', _reset);
    setBtn.addEventListener('click', _setDuration);

    // Allow pressing Enter in the duration input
    durationIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _setDuration();
    });
  }

  return { init };
})();

/* ============================================================
   TODO MODULE
   Handles: add, edit, complete, delete tasks; LocalStorage;
            Challenge 3 (duplicate prevention); sort toggle
   ============================================================ */

const Todo = (() => {
  const form      = document.getElementById('todo-form');
  const input     = document.getElementById('todo-input');
  const errorSpan = document.getElementById('todo-error');
  const listEl    = document.getElementById('todo-list');
  const sortBtn   = document.getElementById('todo-sort');

  // Edit modal elements
  const editOverlay = document.getElementById('edit-modal-overlay');
  const editForm    = document.getElementById('edit-form');
  const editInput   = document.getElementById('edit-input');
  const closeEdit   = document.getElementById('close-edit-modal');

  let _tasks      = [];
  let _sortedMode = false;
  let _editingId  = null;

  const STORAGE_KEY = 'dashboard_tasks';

  /* ── persistence ── */

  function _load() {
    _tasks = Storage.get(STORAGE_KEY, []);
  }

  function _save() {
    Storage.set(STORAGE_KEY, _tasks);
  }

  /* ── helpers ── */

  function _genId() {
    return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Case-insensitive duplicate check (Challenge 3). */
  function _isDuplicate(text, excludeId = null) {
    const normalised = text.trim().toLowerCase();
    return _tasks.some(
      (t) => t.text.toLowerCase() === normalised && t.id !== excludeId
    );
  }

  /** Return tasks in display order. */
  function _getDisplayTasks() {
    if (!_sortedMode) return [..._tasks];
    return [..._tasks].sort((a, b) =>
      a.text.localeCompare(b.text, undefined, { sensitivity: 'base' })
    );
  }

  /* ── rendering ── */

  function _render() {
    const tasks = _getDisplayTasks();
    listEl.innerHTML = '';

    if (tasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo__empty';
      empty.textContent = 'No tasks yet. Add one above!';
      listEl.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'todo__item' + (task.done ? ' todo__item--done' : '');
      li.dataset.id = task.id;
      li.setAttribute('role', 'listitem');

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type      = 'checkbox';
      checkbox.className = 'todo__checkbox';
      checkbox.checked   = task.done;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => _toggle(task.id));

      // Text
      const span = document.createElement('span');
      span.className   = 'todo__text';
      span.textContent = task.text;

      // Action buttons
      const actions = document.createElement('div');
      actions.className = 'todo__actions';

      const editBtn = document.createElement('button');
      editBtn.className       = 'todo__btn todo__btn--edit';
      editBtn.innerHTML       = '✏️';
      editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
      editBtn.addEventListener('click', () => _openEdit(task.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.className     = 'todo__btn todo__btn--delete';
      deleteBtn.innerHTML     = '🗑️';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      deleteBtn.addEventListener('click', () => _delete(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(actions);
      listEl.appendChild(li);
    });
  }

  /* ── actions ── */

  function _add(text) {
    _tasks.push({ id: _genId(), text: text.trim(), done: false });
    _save();
    _render();
  }

  function _toggle(id) {
    const task = _tasks.find((t) => t.id === id);
    if (task) {
      task.done = !task.done;
      _save();
      _render();
    }
  }

  function _delete(id) {
    _tasks = _tasks.filter((t) => t.id !== id);
    _save();
    _render();
  }

  function _openEdit(id) {
    const task = _tasks.find((t) => t.id === id);
    if (!task) return;
    _editingId        = id;
    editInput.value   = task.text;
    editOverlay.hidden = false;
    editInput.focus();
    editInput.select();
  }

  function _closeEditModal() {
    editOverlay.hidden = true;
    _editingId = null;
  }

  function _saveEdit(e) {
    e.preventDefault();
    const newText = editInput.value.trim();
    if (!newText) return;

    if (_isDuplicate(newText, _editingId)) {
      // Show inline error in modal (reuse edit input border)
      editInput.setCustomValidity('Duplicate task!');
      editInput.reportValidity();
      return;
    }
    editInput.setCustomValidity('');

    const task = _tasks.find((t) => t.id === _editingId);
    if (task) {
      task.text = newText;
      _save();
      _render();
    }
    _closeEditModal();
  }

  /* ── form submission ── */

  function _handleSubmit(e) {
    e.preventDefault();
    errorSpan.textContent = '';

    const text = input.value.trim();

    if (!text) {
      errorSpan.textContent = 'Task cannot be empty.';
      input.focus();
      return;
    }

    // Challenge 3: prevent duplicates
    if (_isDuplicate(text)) {
      errorSpan.textContent = `"${text}" is already in your list.`;
      input.focus();
      return;
    }

    _add(text);
    input.value = '';
    input.focus();
  }

  /* ── sort toggle ── */

  function _toggleSort() {
    _sortedMode = !_sortedMode;
    sortBtn.textContent      = _sortedMode ? '↕ Unsort' : '↕ Sort';
    sortBtn.setAttribute('aria-label',
      _sortedMode ? 'Remove sort' : 'Sort tasks alphabetically'
    );
    _render();
  }

  /* ── modal keyboard / overlay click ── */

  function _editOverlayClick(e) {
    if (e.target === editOverlay) _closeEditModal();
  }

  function _editOverlayKeydown(e) {
    if (e.key === 'Escape') _closeEditModal();
  }

  function init() {
    _load();
    _render();

    form.addEventListener('submit', _handleSubmit);
    sortBtn.addEventListener('click', _toggleSort);

    editForm.addEventListener('submit', _saveEdit);
    closeEdit.addEventListener('click', _closeEditModal);
    editOverlay.addEventListener('click', _editOverlayClick);
    editOverlay.addEventListener('keydown', _editOverlayKeydown);
  }

  return { init };
})();

/* ============================================================
   QUICK LINKS MODULE
   Handles: add link, open in new tab, delete link; LocalStorage
   ============================================================ */

const QuickLinks = (() => {
  const form      = document.getElementById('links-form');
  const nameInput = document.getElementById('links-name');
  const urlInput  = document.getElementById('links-url');
  const errorSpan = document.getElementById('links-error');
  const gridEl    = document.getElementById('links-grid');

  let _links = [];

  const STORAGE_KEY = 'dashboard_links';

  /* ── persistence ── */

  function _load() {
    _links = Storage.get(STORAGE_KEY, []);
  }

  function _save() {
    Storage.set(STORAGE_KEY, _links);
  }

  /* ── helpers ── */

  function _genId() {
    return `l_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Ensure the URL has a protocol so it doesn't resolve relative to page. */
  function _normaliseUrl(raw) {
    const trimmed = raw.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'https://' + trimmed;
    }
    return trimmed;
  }

  /* ── rendering ── */

  function _render() {
    gridEl.innerHTML = '';

    if (_links.length === 0) {
      const empty = document.createElement('p');
      empty.className   = 'links__empty';
      empty.textContent = 'No links yet. Add your favourites above!';
      gridEl.appendChild(empty);
      return;
    }

    _links.forEach((link) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'link__item';
      wrapper.setAttribute('role', 'listitem');

      const a = document.createElement('a');
      a.className = 'link__btn';
      a.href      = link.url;
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';
      a.textContent = link.name;
      a.setAttribute('aria-label', `Open ${link.name}`);

      const delBtn = document.createElement('button');
      delBtn.className = 'link__delete';
      delBtn.innerHTML = '✕';
      delBtn.setAttribute('aria-label', `Remove ${link.name}`);
      delBtn.addEventListener('click', () => _delete(link.id));

      wrapper.appendChild(a);
      wrapper.appendChild(delBtn);
      gridEl.appendChild(wrapper);
    });
  }

  /* ── actions ── */

  function _add(name, url) {
    _links.push({ id: _genId(), name: name.trim(), url });
    _save();
    _render();
  }

  function _delete(id) {
    _links = _links.filter((l) => l.id !== id);
    _save();
    _render();
  }

  /* ── form submission ── */

  function _handleSubmit(e) {
    e.preventDefault();
    errorSpan.textContent = '';

    const name = nameInput.value.trim();
    const raw  = urlInput.value.trim();

    if (!name) {
      errorSpan.textContent = 'Please enter a label for the link.';
      nameInput.focus();
      return;
    }

    if (!raw) {
      errorSpan.textContent = 'Please enter a URL.';
      urlInput.focus();
      return;
    }

    const url = _normaliseUrl(raw);

    // Basic URL sanity check
    try {
      new URL(url);
    } catch {
      errorSpan.textContent = 'Please enter a valid URL (e.g. https://example.com).';
      urlInput.focus();
      return;
    }

    _add(name, url);
    nameInput.value = '';
    urlInput.value  = '';
    nameInput.focus();
  }

  function init() {
    _load();
    _render();
    form.addEventListener('submit', _handleSubmit);
  }

  return { init };
})();

/* ============================================================
   THEME MODULE  (Challenge 1 — Light / Dark mode)
   ============================================================ */

const Theme = (() => {
  const html       = document.documentElement;
  const toggleBtn  = document.getElementById('theme-toggle');
  const icon       = toggleBtn.querySelector('.theme-icon');

  const STORAGE_KEY = 'dashboard_theme';

  function _apply(theme) {
    html.setAttribute('data-theme', theme);
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    toggleBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    Storage.set(STORAGE_KEY, theme);
  }

  function _toggle() {
    const current = html.getAttribute('data-theme');
    _apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    // Respect saved preference; otherwise check system preference
    const saved  = Storage.get(STORAGE_KEY, null);
    const system = window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
    _apply(saved ?? system);

    toggleBtn.addEventListener('click', _toggle);
  }

  return { init };
})();

/* ============================================================
   APP INIT — boot all modules after DOM is ready
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Timer.init();
  Todo.init();
  QuickLinks.init();
});
