/* ============================================================
   PERSONAL DASHBOARD — script.js
   Features:
     MVP  : Greeting, time/date, Focus Timer, To-Do, Quick Links
     Extra: Light/Dark mode, Custom name, Change Pomodoro time,
            Prevent duplicate tasks, Sort tasks
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   STORAGE HELPERS
   ---------------------------------------------------------- */
const storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* ----------------------------------------------------------
   THEME (Challenge 1: Light / Dark mode)
   ---------------------------------------------------------- */
const themeToggleBtn = document.getElementById('theme-toggle');
let currentTheme = storage.get('theme', 'light');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  currentTheme = theme;
  storage.set('theme', theme);
}

applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

/* ----------------------------------------------------------
   GREETING & DATE/TIME (MVP + Challenge 2: Custom name)
   ---------------------------------------------------------- */
const greetingTextEl  = document.getElementById('greeting-text');
const userNameDisplay = document.getElementById('user-name-display');
const currentTimeEl   = document.getElementById('current-time');
const currentDateEl   = document.getElementById('current-date');
const nameInput       = document.getElementById('name-input');
const nameSaveBtn     = document.getElementById('name-save-btn');

let userName = storage.get('userName', '');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function updateGreeting() {
  greetingTextEl.textContent = getGreeting();
  userNameDisplay.textContent = userName ? `, ${userName}` : '';
}

function updateDateTime() {
  const now = new Date();

  // Time
  currentTimeEl.textContent = now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Date
  currentDateEl.textContent = now.toLocaleDateString([], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// Populate name input with saved value
nameInput.value = userName;
updateGreeting();
updateDateTime();

// Tick every second
setInterval(() => {
  updateDateTime();
  updateGreeting(); // greeting may change at midnight
}, 1000);

// Save name
nameSaveBtn.addEventListener('click', () => {
  const trimmed = nameInput.value.trim();
  userName = trimmed;
  storage.set('userName', userName);
  updateGreeting();
  showToast(userName ? `Name saved: ${userName}` : 'Name cleared');
});

nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') nameSaveBtn.click();
});

/* ----------------------------------------------------------
   FOCUS TIMER (MVP + Challenge 3: Change Pomodoro time)
   ---------------------------------------------------------- */
const timerDisplay    = document.getElementById('timer-display');
const timerStartBtn   = document.getElementById('timer-start');
const timerStopBtn    = document.getElementById('timer-stop');
const timerResetBtn   = document.getElementById('timer-reset');
const customMinInput  = document.getElementById('custom-minutes');
const timerSetCustom  = document.getElementById('timer-set-custom');

let timerDuration = storage.get('timerDuration', 25); // minutes
let timerSecondsLeft = timerDuration * 60;
let timerInterval = null;
let timerRunning = false;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerSecondsLeft);
  timerDisplay.classList.toggle('running', timerRunning && timerSecondsLeft > 0);
  timerDisplay.classList.toggle('finished', timerSecondsLeft === 0);
}

function startTimer() {
  if (timerRunning) return;
  if (timerSecondsLeft === 0) return; // already done, must reset first
  timerRunning = true;
  renderTimer();
  timerInterval = setInterval(() => {
    timerSecondsLeft--;
    renderTimer();
    if (timerSecondsLeft === 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      showToast('⏰ Time\'s up! Great focus session!');
      // Optional: browser notification
      if (Notification.permission === 'granted') {
        new Notification('Focus Timer', { body: 'Time\'s up! Great work!' });
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  renderTimer();
}

function resetTimer() {
  stopTimer();
  timerSecondsLeft = timerDuration * 60;
  renderTimer();
}

// Set custom duration
timerSetCustom.addEventListener('click', () => {
  const val = parseInt(customMinInput.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    showToast('Please enter a number between 1 and 120', 'error');
    return;
  }
  timerDuration = val;
  storage.set('timerDuration', timerDuration);
  resetTimer();
  showToast(`Timer set to ${val} minutes`);
});

timerStartBtn.addEventListener('click', startTimer);
timerStopBtn.addEventListener('click',  stopTimer);
timerResetBtn.addEventListener('click', resetTimer);

// Restore saved duration
customMinInput.value = timerDuration;
renderTimer();

// Request notification permission once
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

/* ----------------------------------------------------------
   TO-DO LIST
   MVP: add, edit, mark done, delete + LocalStorage
   Challenge 4: Prevent duplicates
   Challenge 5: Sort tasks
   ---------------------------------------------------------- */
const taskInput   = document.getElementById('task-input');
const taskAddBtn  = document.getElementById('task-add-btn');
const taskListEl  = document.getElementById('task-list');
const sortAllBtn    = document.getElementById('sort-all');
const sortActiveBtn = document.getElementById('sort-active');
const sortDoneBtn   = document.getElementById('sort-done');
const sortAlphaBtn  = document.getElementById('sort-alpha');

let tasks   = storage.get('tasks', []);   // [{id, text, done}]
let sortMode = 'all'; // 'all' | 'active' | 'done' | 'alpha'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function saveTasks() {
  storage.set('tasks', tasks);
}

function isDuplicate(text) {
  return tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
}

function getVisibleTasks() {
  let list = [...tasks];
  if (sortMode === 'active') list = list.filter(t => !t.done);
  else if (sortMode === 'done') list = list.filter(t => t.done);
  if (sortMode === 'alpha') list.sort((a, b) => a.text.localeCompare(b.text));
  return list;
}

function renderTasks() {
  taskListEl.innerHTML = '';
  const visible = getVisibleTasks();
  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-item__check';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-item__text';
    span.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-item__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--secondary';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', `Edit task "${task.text}"`);
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, span, actions);
    taskListEl.appendChild(li);
  });
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showToast('Task cannot be empty', 'error');
    return;
  }
  // Challenge: prevent duplicates
  if (isDuplicate(trimmed)) {
    showToast('Task already exists!', 'error');
    return;
  }
  tasks.push({ id: generateId(), text: trimmed, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Sort buttons
function setSortMode(mode) {
  sortMode = mode;
  [sortAllBtn, sortActiveBtn, sortDoneBtn, sortAlphaBtn].forEach(btn => {
    btn.classList.remove('btn--chip--active');
  });
  const map = { all: sortAllBtn, active: sortActiveBtn, done: sortDoneBtn, alpha: sortAlphaBtn };
  map[mode].classList.add('btn--chip--active');
  renderTasks();
}

sortAllBtn.addEventListener('click',    () => setSortMode('all'));
sortActiveBtn.addEventListener('click', () => setSortMode('active'));
sortDoneBtn.addEventListener('click',   () => setSortMode('done'));
sortAlphaBtn.addEventListener('click',  () => setSortMode('alpha'));

taskAddBtn.addEventListener('click', () => addTask(taskInput.value));
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask(taskInput.value);
});

renderTasks();

/* ----------------------------------------------------------
   EDIT TASK MODAL
   ---------------------------------------------------------- */
const editModal     = document.getElementById('edit-modal');
const modalOverlay  = document.getElementById('modal-overlay');
const editInput     = document.getElementById('edit-input');
const editSaveBtn   = document.getElementById('edit-save-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let editingTaskId = null;

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editInput.value = task.text;
  editModal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  editInput.focus();
  editInput.select();
}

function closeEditModal() {
  editModal.classList.add('hidden');
  modalOverlay.classList.add('hidden');
  editingTaskId = null;
}

function saveEdit() {
  const trimmed = editInput.value.trim();
  if (!trimmed) {
    showToast('Task text cannot be empty', 'error');
    return;
  }
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  // Duplicate check (allow saving same text as-is)
  if (trimmed.toLowerCase() !== task.text.toLowerCase() && isDuplicate(trimmed)) {
    showToast('A task with that name already exists!', 'error');
    return;
  }

  task.text = trimmed;
  saveTasks();
  renderTasks();
  closeEditModal();
}

editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeEditModal);
modalOverlay.addEventListener('click', closeEditModal);
editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEdit();
  if (e.key === 'Escape') closeEditModal();
});

/* ----------------------------------------------------------
   QUICK LINKS (MVP + LocalStorage)
   ---------------------------------------------------------- */
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const linkAddBtn    = document.getElementById('link-add-btn');
const linksContainer = document.getElementById('links-container');

let links = storage.get('links', []); // [{id, name, url}]

function saveLinks() {
  storage.set('links', links);
}

function renderLinks() {
  linksContainer.innerHTML = '';
  links.forEach(link => {
    const a = document.createElement('a');
    a.className = 'link-chip';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const label = document.createElement('span');
    label.className = 'link-chip__label';
    label.textContent = link.name;

    const delBtn = document.createElement('button');
    delBtn.className = 'link-chip__delete';
    delBtn.textContent = '✕';
    delBtn.title = `Remove ${link.name}`;
    delBtn.setAttribute('aria-label', `Remove link ${link.name}`);
    delBtn.addEventListener('click', e => {
      e.preventDefault(); // don't follow link
      deleteLink(link.id);
    });

    a.append(label, delBtn);
    linksContainer.appendChild(a);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  const rawUrl = linkUrlInput.value.trim();

  if (!name) {
    showToast('Please enter a label for the link', 'error');
    return;
  }
  if (!rawUrl) {
    showToast('Please enter a URL', 'error');
    return;
  }

  // Ensure URL has a scheme
  let url = rawUrl;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  try {
    new URL(url); // validate
  } catch {
    showToast('Please enter a valid URL', 'error');
    return;
  }

  links.push({ id: generateId(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value = '';
  linkNameInput.focus();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

linkAddBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addLink();
});

renderLinks();

/* ----------------------------------------------------------
   TOAST NOTIFICATIONS
   ---------------------------------------------------------- */
let toastTimeout;

function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '28px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)',
    color: '#fff',
    padding: '10px 22px',
    borderRadius: '30px',
    fontSize: '.9rem',
    fontWeight: '600',
    boxShadow: '0 4px 16px rgba(0,0,0,.25)',
    zIndex: '999',
    pointerEvents: 'none',
    transition: 'opacity .3s',
    opacity: '1'
  });
  document.body.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
