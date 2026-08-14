// ==========================
// Greeting & Clock
// ==========================
const greetingEl = document.getElementById('greeting');
const dateTimeEl = document.getElementById('dateTime');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');

function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = 'Selamat Malam';

  if (hour >= 5 && hour < 12) greeting = 'Selamat Pagi';
  else if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';

  const name = localStorage.getItem('userName') || '';
  greetingEl.textContent = name
    ? `${greeting}, ${name}!`
    : `${greeting}!`;

  dateTimeEl.textContent = now.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

saveNameBtn.addEventListener('click', () => {
  localStorage.setItem('userName', nameInput.value.trim());
  updateGreeting();
});

nameInput.value = localStorage.getItem('userName') || '';
updateGreeting();
setInterval(updateGreeting, 1000);

// ==========================
// Theme Toggle
// ==========================
const themeToggle = document.getElementById('themeToggle');

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');

  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
});

loadTheme();

// ==========================
// Pomodoro Timer
// ==========================
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

let duration = 25 * 60;
let timeLeft = duration;
let timer = null;

function renderTimer() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

startBtn.addEventListener('click', () => {
  if (timer) return;

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      timer = null;
      alert('Waktu fokus selesai!');
      timeLeft = duration;
    }

    renderTimer();
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
  timeLeft = duration;
  renderTimer();
});

renderTimer();

// ==========================
// To-Do List
// ==========================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');

    const text = document.createElement('span');
    text.className = 'task-text' + (task.done ? ' done' : '');
    text.textContent = task.text;

    text.addEventListener('click', () => {
      tasks[index].done = !tasks[index].done;
      saveTasks();
      renderTasks();
    });

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';

    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit tugas', task.text);

      if (!newText) return;

      const trimmed = newText.trim();

      if (!trimmed) return;

      const duplicate = tasks.some(
        (t, i) => i !== index && t.text.toLowerCase() === trimmed.toLowerCase()
      );

      if (duplicate) {
        alert('Tugas sudah ada!');
        return;
      }

      tasks[index].text = trimmed;
      saveTasks();
      renderTasks();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';

    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    actions.append(editBtn, deleteBtn);
    li.append(text, actions);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) return;

  const duplicate = tasks.some(
    task => task.text.toLowerCase() === text.toLowerCase()
  );

  if (duplicate) {
    alert('Tugas sudah ada!');
    return;
  }

  tasks.push({ text, done: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

renderTasks();

// ==========================
// Quick Links
// ==========================
const linkName = document.getElementById('linkName');
const linkUrl = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLinkBtn');
const linksContainer = document.getElementById('linksContainer');

let links = JSON.parse(localStorage.getItem('links')) || [
  { name: 'Google', url: 'https://google.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'GitHub', url: 'https://github.com' }
];

function saveLinks() {
  localStorage.setItem('links', JSON.stringify(links));
}

function renderLinks() {
  linksContainer.innerHTML = '';

  links.forEach((link, index) => {
    const card = document.createElement('div');
    card.className = 'link-card';

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.textContent = link.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';

    deleteBtn.addEventListener('click', () => {
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    card.append(a, deleteBtn);
    linksContainer.appendChild(card);
  });
}

function addLink() {
  const name = linkName.value.trim();
  const url = linkUrl.value.trim();

  if (!name || !url) return;

  links.push({ name, url });
  linkName.value = '';
  linkUrl.value = '';

  saveLinks();
  renderLinks();
}

addLinkBtn.addEventListener('click', addLink);

renderLinks();