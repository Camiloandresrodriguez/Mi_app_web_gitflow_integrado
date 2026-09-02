const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskSummary = document.getElementById('task-summary');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedButton = document.getElementById('clear-completed');
const toggleAllButton = document.getElementById('toggle-all');

let tasks = [
  { id: 1, text: 'Revisar el proyecto', done: false },
  { id: 2, text: 'Preparar la presentación', done: true }
];

let currentFilter = 'all';

function getVisibleTasks() {
  if (currentFilter === 'pending') {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function updateToggleAllButton() {
  if (tasks.length === 0) {
    toggleAllButton.disabled = true;
    toggleAllButton.textContent = 'Completar todas';
    return;
  }

  const allCompleted = tasks.every((task) => task.done);
  toggleAllButton.disabled = false;
  toggleAllButton.textContent = allCompleted ? 'Desmarcar todas' : 'Completar todas';
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = '';

  if (visibleTasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent =
      currentFilter === 'all'
        ? 'No hay tareas por ahora'
        : currentFilter === 'pending'
          ? 'No tienes tareas pendientes'
          : 'No hay tareas completadas';
    taskList.appendChild(emptyState);
  } else {
    visibleTasks.forEach((task) => {
      const item = document.createElement('li');
      item.className = `task-item ${task.done ? 'completed' : ''}`;
      item.dataset.id = String(task.id);

      const label = document.createElement('label');
      label.className = 'task-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', `Marcar ${task.text}`);

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-btn';
      deleteButton.textContent = 'Eliminar';
      deleteButton.setAttribute('data-id', String(task.id));

      label.appendChild(checkbox);
      label.appendChild(text);
      item.appendChild(label);
      item.appendChild(deleteButton);
      taskList.appendChild(item);
    });
  }

  const pendingTasks = tasks.filter((task) => !task.done).length;
  const completedTasks = tasks.length - pendingTasks;
  taskSummary.textContent = `${pendingTasks} pendiente${pendingTasks === 1 ? '' : 's'} · ${completedTasks} completada${completedTasks === 1 ? '' : 's'}`;
  updateToggleAllButton();
}

function addTask(text) {
  const value = text.trim();

  if (!value) {
    return;
  }

  const taskExists = tasks.some((task) => task.text.toLowerCase() === value.toLowerCase());
  if (taskExists) {
    alert(`⚠️ Ya existe una tarea con el nombre "${value}"`);
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text: value,
    done: false
  });

  renderTasks();
  taskForm.reset();
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, done: !task.done };
    }
    return task;
  });

  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.done);
  renderTasks();
}

function toggleAllTasks() {
  if (tasks.length === 0) {
    return;
  }

  const shouldMarkAllComplete = !tasks.every((task) => task.done);
  tasks = tasks.map((task) => ({
    ...task,
    done: shouldMarkAllComplete
  }));

  renderTasks();
}

function setFilter(filterName) {
  currentFilter = filterName;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderTasks();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

taskList.addEventListener('change', (event) => {
  const checkbox = event.target;

  if (checkbox.matches('input[type="checkbox"]')) {
    const taskId = Number(checkbox.closest('.task-item')?.dataset.id);
    if (!Number.isNaN(taskId)) {
      toggleTask(taskId);
    }
  }
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('.delete-btn');

  if (!button) {
    return;
  }

  const taskId = Number(button.dataset.id);
  if (!Number.isNaN(taskId)) {
    deleteTask(taskId);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);
toggleAllButton.addEventListener('click', toggleAllTasks);

renderTasks();
