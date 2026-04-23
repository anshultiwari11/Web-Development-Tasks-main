/**
 * To-Do List Frontend Script
 * Handles UI interactions and API communication
 */

// DOM Elements
const emailInput = document.getElementById('emailInput');
const reminderInput = document.getElementById('reminderInput');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const statusMessage = document.getElementById('statusMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const taskCounter = document.getElementById('taskCounter');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  setMinimumReminderTime();
  loadTasks();
});

addBtn.addEventListener('click', handleAddTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleAddTask();
  }
});

emailInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    reminderInput.focus();
  }
});

reminderInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    taskInput.focus();
  }
});

/**
 * Load all tasks from the backend
 */
async function loadTasks() {
  try {
    showLoading(true);
    const response = await fetch('/api/tasks');

    if (!response.ok) {
      throw new Error('Failed to load tasks');
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      throw new Error('Invalid response format - expected JSON');
    }

    const tasks = result.data || [];
    displayTasks(tasks);
    showLoading(false);
  } catch (error) {
    console.error('Error loading tasks:', error);
    showMessage('Error loading tasks. Please refresh the page.', 'error');
    showLoading(false);
  }
}

/**
 * Display tasks in the UI
 */
function displayTasks(tasks) {
  tasksList.innerHTML = '';

  if (tasks.length === 0) {
    tasksList.innerHTML = '<p class="no-tasks">✨ No tasks yet. Create one to get started!</p>';
    if (taskCounter) {
      taskCounter.textContent = '0';
    }
    return;
  }

  if (taskCounter) {
    taskCounter.textContent = tasks.length;
  }

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    tasksList.appendChild(taskElement);
  });
}

/**
 * Create a task DOM element
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.id = `task-${task.id}`;

  const createdAt = new Date(task.createdAt).toLocaleString();
  const reminderTime = new Date(task.reminderAt).toLocaleString();
  const email = task.email || '';

  li.innerHTML = `
    <div class="task-content">
      <div class="task-text">${escapeHtml(task.text)}</div>
      <div class="task-email">📧 ${escapeHtml(email)}</div>
      <div class="task-time">🕒 Reminder: ${reminderTime}</div>
      <div class="task-time">⏰ Created: ${createdAt}</div>
    </div>
    <div class="task-actions">
      <button class="btn btn-secondary btn-sm" onclick="handleEditTask(${task.id})">
        ✏️ Edit
      </button>
      <button class="btn btn-danger btn-sm" onclick="handleDeleteTask(${task.id})">
        🗑️ Delete
      </button>
    </div>
  `;

  return li;
}

/**
 * Handle adding a new task
 */
async function handleAddTask() {
  const email = emailInput.value.trim();
  const reminderAt = reminderInput.value;
  const text = taskInput.value.trim();

  // Validation
  if (!email) {
    showMessage('Please enter your email address', 'error');
    emailInput.focus();
    return;
  }

  if (!isValidEmail(email)) {
    showMessage('Please enter a valid email address', 'error');
    emailInput.focus();
    return;
  }

  if (!text) {
    showMessage('Please enter a task', 'error');
    taskInput.focus();
    return;
  }

  if (!reminderAt) {
    showMessage('Please select a reminder date and time', 'error');
    reminderInput.focus();
    return;
  }

  if (new Date(reminderAt).getTime() <= Date.now()) {
    showMessage('Reminder time must be in the future', 'error');
    reminderInput.focus();
    return;
  }

  try {
    showLoading(true);
    const response = await fetch('/api/tasks/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        text: text,
        reminderAt: new Date(reminderAt).toISOString()
      })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to add task';
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.error || errorResult.message || errorMessage;
      } catch (jsonError) {
        // Response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      throw new Error('Invalid response from server. Please try again.');
    }

    showMessage(`✅ Task added! Reminder scheduled for ${new Date(reminderAt).toLocaleString()}`, 'success');

    // Clear inputs
    emailInput.value = '';
    taskInput.value = '';
    reminderInput.value = '';
    setMinimumReminderTime();
    emailInput.focus();

    // Reload tasks
    await loadTasks();
    showLoading(false);
  } catch (error) {
    console.error('Error adding task:', error);
    showMessage(`Error: ${error.message}`, 'error');
    showLoading(false);
  }
}

/**
 * Handle editing a task
 */
async function handleEditTask(id) {
  try {
    // Find the current task
    const response = await fetch('/api/tasks');
    
    if (!response.ok) {
      throw new Error('Failed to load tasks');
    }
    
    let tasksResult;
    try {
      tasksResult = await response.json();
    } catch (jsonError) {
      showMessage('Error loading tasks', 'error');
      return;
    }
    const task = tasksResult.data.find(t => t.id === id);

    if (!task) {
      showMessage('Task not found', 'error');
      return;
    }

    // Prompt for new text
    const newText = prompt('Edit task:', task.text);

    if (newText === null) {
      // User cancelled
      return;
    }

    if (!newText.trim()) {
      showMessage('Task text cannot be empty', 'error');
      return;
    }

    showLoading(true);
    const updateResponse = await fetch('/api/tasks/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        text: newText.trim()
      })
    });

    if (!updateResponse.ok) {
      let errorMessage = 'Failed to update task';
      try {
        const errorResult = await updateResponse.json();
        errorMessage = errorResult.error || errorResult.message || errorMessage;
      } catch (jsonError) {
        // Response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    let updateResult;
    try {
      updateResult = await updateResponse.json();
    } catch (jsonError) {
      throw new Error('Invalid response from server');
    }

    showMessage('Task updated successfully', 'success');
    await loadTasks();
    showLoading(false);
  } catch (error) {
    console.error('Error updating task:', error);
    showMessage(`Error: ${error.message}`, 'error');
    showLoading(false);
  }
}

/**
 * Handle deleting a task
 */
async function handleDeleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`/api/tasks/delete/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete task';
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.error || errorResult.message || errorMessage;
      } catch (jsonError) {
        // Response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      throw new Error('Invalid response from server');
    }

    showMessage('Task deleted successfully', 'success');
    await loadTasks();
    showLoading(false);
  } catch (error) {
    console.error('Error deleting task:', error);
    showMessage(`Error: ${error.message}`, 'error');
    showLoading(false);
  }
}

/**
 * Show status message
 */
function showMessage(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 5000);
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
  if (show) {
    loadingSpinner.classList.add('active');
  } else {
    loadingSpinner.classList.remove('active');
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function setMinimumReminderTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  reminderInput.min = localDateTime;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
