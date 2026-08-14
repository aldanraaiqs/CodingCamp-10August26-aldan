'use strict';

/* ============================================================
   DASHBOARD — script.js
   MVP  : Greeting + clock, Focus Timer, To-Do, Quick Links
   Extra: Dark mode, Custom name, Custom Pomodoro time,
          Prevent duplicate tasks, Sort tasks
   ============================================================ */

/* ── helpers ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const store = {
  get: (k, fallback = null) => {
    try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── toast ───────────────────────────────────────────────── */
let toastTimer;
function toast(msg, type = 'info') {
  const el = $('toast');
  clearTimeout(toastTimer);
  el.textContent  = msg;
  el.className    = `toast${type === 'error' ? ' error' : ''}`;
  el.style.opacity = '1';
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.classList.add('hidden'), 300);
  }, 2500);
}

/* ============================================================
   THEME  (Challenge 1 — Light / Dark mode)
   ============================================================ */
const themeBtn = $('themeToggle');
let theme = store.get('theme', 'light');

function applyTheme(t) {
  theme = t;
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  themeBtn.title       = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  store.set('theme', t);
}

applyTheme(theme);
themeBtn.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

/* ============================================================
   GREETING + CLOCK  (MVP)
   ============================================================ */
const greetingEl = $('greeting');
const dateTimeEl = $('dateTime');
const nameInput  = $('nameInput');
const saveNameBtn = $('saveNameBtn');

let userName = store.get('userName', '');
nameInput.value = userName;

function getGreeting(hour) {
  if (hour <  5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now  = new Date();
  const hour = now.getHours();
  const base = getGreeting(hour);

  greetingEl.textContent = userName ? `${base}, ${userName}!` : `${base}!`;

  dateTimeEl.textContent = now.toLocaleDateString([], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) + '  ·  ' + now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

updateClock();
setInterval(updateClock, 1000);

/* Challenge 2 — custom name */
function saveName() {
  userName = nameInput.value.trim();
  store.set('userName', userName);
  updateClock();
  toast(userName ? `Name saved: ${userName}` : 'Name cleared');
}

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });

/* ============================================================
   FOCUS TIMER  (MVP + Challenge 3 — custom Pomodoro time)
   ============================================================ */
const timerDisplay  = $('timerDisplay');
const startBtn      = $('startBtn');
const stopBtn       = $('stopBtn');
const resetBtn      = $('resetBtn');
const customMinutes = $('customMinutes');
const setTimerBtn   = $('setTimerBtn');

let timerDuration  = store.get('timerDuration', 25); // minutes
let secondsLeft    = timerDuration * 60;
let timerInterval  = null;
let timerRunning   = false;

customMinutes.value = timerDuration;

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function renderTimer() {
  timerDisplay.textContent = fmt(secondsLeft);
  timerDisplay.classList.toggle('running',  timerRunning && secondsLeft > 0);
  timerDisplay.classList.toggle('finished', secondsLeft === 0 && !timerRunning);
}

function startTimer() {
  if (timerRunning || secondsLeft === 0) return;
  timerRunning = true;
  renderTimer();
  timerInterval = setInterval(() => {
    secondsLeft--;
    renderTimer();
    if (secondsLeft === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      toast("⏰ Time's up! Great session!");
    }
  }, 1000);
}

function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  renderTimer();
}

function resetTimer() {
  stopTimer();
  secondsLeft = timerDuration * 60;
  renderTimer();
}

setTimerBtn.addEventListener('click', () => {
  const val = parseInt(customMinutes.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    toast('Enter a number between 1 and 120', 'error');
    return;
  }
  timerDuration = val;
  store.set('timerDuration', timerDuration);
  resetTimer();
  toast(`Timer set to ${val} minute${val > 1 ? 's' : ''}`);
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click',  stopTimer);
resetBtn.addEventListener('click', resetTimer);
renderTimer();

/* ============================================================
   TO-DO LIST  (MVP + Challenge 4 — no duplicates + Challenge 5 — sort)
   ============================================================ */
const taskInput  = $('taskInput');
const addTaskBtn = $('addTaskBtn');
const taskListEl = $('taskList');

let tasks      = store.get('tasks', []);  // [{id, text, done}]
let filterMode = 'all';                   // 'all' | 'active' | 'done' | 'az'

function saveTasks()          { store.set('tasks', tasks); }
function isDup(text, skipId)  {
  return tasks.some(t => t.id !== skipId && t.text.toLowerCase() === text.toLowerCase());
}

function getVisible() {
  let list = [...tasks];
  if (filterMode === 'active') list = list.filter(t => !t.done);
  else if (filterMode === 'done') list = list.filter(t => t.done);
  if (filterMode === 'az') list.sort((a, b) => a.text.localeCompare(b.text));
  return list;
}

function renderTasks() {
  taskListEl.innerHTML = '';
  getVisible().forEach(task => {
    const li  = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;

    const cb  = document.createElement('input');
    cb.type   = 'checkbox';
    cb.checked = task.done;
    cb.setAttribute('aria-label', `Mark "${task.text}" done`);
    cb.addEventListener('change', () => {
      const t = tasks.find(t => t.id === task.id);
      if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
    });

    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className   = 'btn-secondary';
    editBtn.addEventListener('click', () => openModal(task.id));

    const delBtn  = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className   = 'btn-danger';
    delBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    taskListEl.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) { toast('Task cannot be empty', 'error'); return; }
  if (isDup(text)) { toast('Task already exists!', 'error'); return; }
  tasks.push({ id: uid(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

/* sort chips */
document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterMode = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();

/* ── edit modal ──────────────────────────────────────────── */
const modalOverlay = $('modalOverlay');
const editModal    = $('editModal');
const editInput    = $('editInput');
const editError    = $('editError');
const editSaveBtn  = $('editSaveBtn');
const editCancelBtn = $('editCancelBtn');
let editingId = null;

function openModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId          = id;
  editInput.value    = task.text;
  editError.classList.add('hidden');
  editModal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  editInput.focus();
  editInput.select();
}

function closeModal() {
  editModal.classList.add('hidden');
  modalOverlay.classList.add('hidden');
  editingId = null;
}

function saveEdit() {
  const text = editInput.value.trim();
  if (!text) {
    editError.textContent = 'Task cannot be empty.';
    editError.classList.remove('hidden');
    return;
  }
  if (isDup(text, editingId)) {
    editError.textContent = 'A task with that name already exists!';
    editError.classList.remove('hidden');
    return;
  }
  const task = tasks.find(t => t.id === editingId);
  if (task) { task.text = text; saveTasks(); renderTasks(); }
  closeModal();
}

editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  saveEdit();
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   QUICK LINKS  (MVP)
   ============================================================ */
const linkNameInput  = $('linkName');
const linkUrlInput   = $('linkUrl');
const addLinkBtn     = $('addLinkBtn');
const linksContainer = $('linksContainer');

const DEFAULT_LINKS = [
  { id: uid(), name: 'Google',  url: 'https://google.com' },
  { id: uid(), name: 'YouTube', url: 'https://youtube.com' },
  { id: uid(), name: 'GitHub',  url: 'https://github.com' }
];

let links = store.get('links', DEFAULT_LINKS);

function saveLinks()  { store.set('links', links); }

function renderLinks() {
  linksContainer.innerHTML = '';
  links.forEach(link => {
    const a   = document.createElement('a');
    a.className  = 'link-pill';
    a.href       = link.url;
    a.target     = '_blank';
    a.rel        = 'noopener noreferrer';

    const label  = document.createElement('span');
    label.textContent = link.name;

    const del    = document.createElement('button');
    del.className   = 'link-delete';
    del.textContent = '✕';
    del.title       = `Remove ${link.name}`;
    del.setAttribute('aria-label', `Remove ${link.name}`);
    del.addEventListener('click', e => {
      e.preventDefault();
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    a.append(label, del);
    linksContainer.appendChild(a);
  });
}

function addLink() {
  const name   = linkNameInput.value.trim();
  let   rawUrl = linkUrlInput.value.trim();

  if (!name)   { toast('Enter a label for the link', 'error'); return; }
  if (!rawUrl) { toast('Enter a URL', 'error'); return; }

  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'https://' + rawUrl;
  try { new URL(rawUrl); } catch { toast('Enter a valid URL', 'error'); return; }

  links.push({ id: uid(), name, url: rawUrl });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
