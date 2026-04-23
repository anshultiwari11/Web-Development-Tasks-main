/**
 * Task Model
 * In-memory storage for tasks
 * Each task contains: id, text, email, reminderAt, reminderSent, createdAt
 */

let tasks = [];
let nextId = 1;

class Task {
  constructor(id, text, email, reminderAt) {
    this.id = id;
    this.text = text;
    this.email = email;
    this.reminderAt = reminderAt;
    this.reminderSent = false;
    this.createdAt = new Date();
  }

  /**
   * Get all tasks
   * @returns {Array} Array of all tasks
   */
  static getAllTasks() {
    return tasks;
  }

  /**
   * Add a new task
   * @param {string} text - Task text
   * @param {string} email - User email
   * @param {string} reminderAt - Reminder date/time (ISO string)
   * @returns {Object} Created task object
   */
  static addTask(text, email, reminderAt) {
    if (!text || !text.trim()) {
      throw new Error('Task text is required');
    }
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!reminderAt) {
      throw new Error('Reminder time is required');
    }

    const reminderDate = new Date(reminderAt);
    if (Number.isNaN(reminderDate.getTime())) {
      throw new Error('Invalid reminder time');
    }
    if (reminderDate.getTime() <= Date.now()) {
      throw new Error('Reminder time must be in the future');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email address');
    }

    const task = new Task(nextId++, text.trim(), normalizedEmail, reminderDate.toISOString());
    tasks.push(task);
    return task;
  }

  /**
   * Get a single task by ID
   * @param {number} id - Task ID
   * @returns {Object} Task object or null
   */
  static getTaskById(id) {
    return tasks.find(task => task.id === parseInt(id));
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {string} text - New task text
   * @returns {Object} Updated task object
   */
  static updateTask(id, text) {
    const task = this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    if (!text || !text.trim()) {
      throw new Error('Task text is required');
    }
    task.text = text.trim();
    return task;
  }

  static markReminderSent(id) {
    const task = this.getTaskById(id);
    if (!task) {
      return null;
    }
    task.reminderSent = true;
    return task;
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {boolean} True if deleted
   */
  static deleteTask(id) {
    const index = tasks.findIndex(task => task.id === parseInt(id));
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(index, 1);
    return true;
  }

  /**
   * Clear all tasks (useful for testing)
   */
  static clearAllTasks() {
    tasks = [];
    nextId = 1;
  }
}

module.exports = Task;
