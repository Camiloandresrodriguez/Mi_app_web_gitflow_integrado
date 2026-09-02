const STORAGE_KEY = 'mi_app_web_tasks_v1';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskSummary = document.getElementById('task-summary');
const taskFeedback = document.getElementById('task-feedback');
const currentDate = document.getElementById('current-date');
const totalCount = document.getElementById('total-count');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const toggleAllButton = document.getElementById('toggle-all');
const clearCompletedButton = document.getElementById('clear-completed');

let currentFilter = 'all';
let tasks = [];
let feedbackTimeout;

function getTaskKey(text) {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function normalizeTask(task) {
  return {
    id: Number(task.id) || Date.now() + Math.random(),
    text: String(task.text || '').trim(),
    completed: Boolean(task.completed),
  };
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const loadedTasks = Array.isArray(savedTasks) ? savedTasks.map(normalizeTask).filter((task) => task.text) : [];
    const knownKeys = new Set();

    tasks = loadedTasks.filter((task) => {
      const taskKey = getTaskKey(task.text);
      if (knownKeys.has(taskKey)) return false;

      knownKeys.add(taskKey);
      return true;
    });

    if (tasks.length !== loadedTasks.length) saveTasks();
  } catch (error) {
    tasks = [];
  }
}

function showFeedback(message) {
  clearTimeout(feedbackTimeout);
  taskFeedback.textContent = message;
  taskFeedback.classList.add('visible');
  feedbackTimeout = setTimeout(() => {
    taskFeedback.classList.remove('visible');
  }, 3500);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  switch (currentFilter) {
    case 'pending':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function updateSummary() {
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.length - pendingTasks;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const label = pendingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes';

  taskSummary.textContent = `${pendingTasks} ${label}`;
  totalCount.textContent = tasks.length;
  pendingCount.textContent = pendingTasks;
  completedCount.textContent = `${completionRate}%`;
}

function render() {
  const visibleTasks = getVisibleTasks();

  if (!visibleTasks.length) {
    taskList.innerHTML = '<li class="empty-state">No hay tareas en esta vista.</li>';
  } else {
    taskList.innerHTML = visibleTasks
      .map(
        (task) => `
          <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <label class="task-label">
              <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Marcar tarea como completada" />
              <span class="task-text">${task.text}</span>
            </label>
            <button type="button" class="delete-btn" aria-label="Eliminar tarea">Eliminar</button>
          </li>
        `
      )
      .join('');
  }

  const hasCompletedTasks = tasks.some((task) => task.completed);
  const allCompleted = tasks.length > 0 && tasks.every((task) => task.completed);

  toggleAllButton.textContent = allCompleted ? 'Desmarcar todas' : 'Completar todas';
  toggleAllButton.disabled = tasks.length === 0;
  clearCompletedButton.disabled = !hasCompletedTasks;
  updateSummary();
}

function addTask(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    showFeedback('Escribe una tarea antes de agregarla.');
    taskInput.focus();
    return false;
  }

  if (tasks.some((task) => getTaskKey(task.text) === getTaskKey(cleanText))) {
    showFeedback('Esta tarea ya existe en tu lista.');
    taskInput.focus();
    return false;
  }

  tasks.unshift({
    id: Date.now() + Math.random(),
    text: cleanText,
    completed: false,
  });

  saveTasks();
  render();
  taskFeedback.classList.remove('visible');
  return true;
}

function toggleTask(id, completed) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, completed } : task));
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function toggleAllTasks() {
  const shouldComplete = !tasks.every((task) => task.completed);
  tasks = tasks.map((task) => ({ ...task, completed: shouldComplete }));
  saveTasks();
  render();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
}

function setFilter(newFilter) {
  currentFilter = newFilter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('active', isActive);
  });

  render();
}

function init() {
  loadTasks();
  currentDate.textContent = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (addTask(taskInput.value)) {
      taskInput.value = '';
      taskInput.focus();
    }
  });

  taskList.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);
    toggleTask(taskId, checkbox.checked);
  });

  taskList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-btn');
    if (!deleteButton) return;

    const taskItem = deleteButton.closest('.task-item');
    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);
    deleteTask(taskId);
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  toggleAllButton.addEventListener('click', toggleAllTasks);
  clearCompletedButton.addEventListener('click', clearCompletedTasks);

  render();
}

init();