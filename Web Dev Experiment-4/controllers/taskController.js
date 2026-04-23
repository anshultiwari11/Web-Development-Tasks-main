/**
 * Task Controller
 * Handles business logic and email sending
 */

const Task = require('../models/taskModel');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const reminderTimers = new Map();

/**
 * Get all tasks
 * GET /api/tasks
 */
const getTasks = async (req, res) => {
  try {
    const tasks = Task.getAllTasks();
    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Add a new task and schedule email reminder
 * POST /api/tasks/add
 */
const addTask = async (req, res) => {
  try {
    const { text, email, reminderAt } = req.body;

    // Validate input
    if (!text || !email || !reminderAt) {
      return res.status(400).json({
        success: false,
        error: 'Task text, email and reminder time are required'
      });
    }

    // Create task in model
    const newTask = Task.addTask(text, email, reminderAt);
    console.log(`📝 New task created: ID=${newTask.id}, Email=${newTask.email}, Task="${newTask.text}"`);

    scheduleReminderForTask(newTask);

    res.status(201).json({
      success: true,
      message: 'Task added successfully and reminder scheduled',
      data: newTask
    });
  } catch (error) {
    console.error('Error adding task:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update an existing task
 * PUT /api/tasks/update
 */
const updateTask = async (req, res) => {
  try {
    const { id, text } = req.body;

    if (!id || !text) {
      return res.status(400).json({
        success: false,
        error: 'Task ID and text are required'
      });
    }

    const updatedTask = Task.updateTask(id, text);
    scheduleReminderForTask(updatedTask);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/delete/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    Task.deleteTask(id);
    clearReminderTimer(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { deletedId: id }
    });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Send email reminder using Resend API
 * @param {string} email - Recipient email
 * @param {string} taskText - Task text
 * @param {string} reminderAt - Reminder time
 */
const sendTaskReminderEmail = async (email, taskText, reminderAt) => {
  // Validate API key exists
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'YOUR_RESEND_API_KEY_HERE') {
    throw new Error('Resend API key is missing. Add RESEND_API_KEY to .env.');
  }

  console.log(`📧 Attempting to send email reminder to: ${email}`);

  const htmlEmail = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { color: #333; text-align: center; margin-bottom: 20px; }
          .task-box { background-color: #e8f4f8; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .task-text { color: #333; font-size: 16px; font-weight: bold; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Task Reminder</h1>
          </div>
          <p>Hello,</p>
          <p>This is your scheduled reminder for:</p>
          <div class="task-box">
            <div class="task-text">${taskText}</div>
          </div>
          <p>Reminder time: <strong>${new Date(reminderAt).toLocaleString()}</strong></p>
          <p>You can manage your tasks anytime by visiting our To-Do List app.</p>
          <div class="footer">
            <p>This is an automated reminder from your To-Do List app.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts += 1;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: '📝 Task Reminder',
        html: htmlEmail
      });

      // Resend can return { data: null, error: {...} } without throwing.
      if (result && result.error) {
        const resendError = new Error(result.error.message || 'Resend API error');
        resendError.name = result.error.name || 'resend_error';
        resendError.statusCode = result.error.statusCode;
        throw resendError;
      }

      console.log(`✅ Email sent successfully to ${email}:`, result);
      return result;
    } catch (error) {
      const isRateLimited = error.statusCode === 429 || error.name === 'rate_limit_exceeded';
      const isLastAttempt = attempts >= maxAttempts;

      if (isRateLimited && !isLastAttempt) {
        console.warn(`⏳ Rate limited by Resend. Retrying for ${email}...`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }

      console.error(`❌ Failed to send email to ${email}:`, error.message || error);
      throw error;
    }
  }
};

function clearReminderTimer(taskId) {
  const existingTimer = reminderTimers.get(Number(taskId));
  if (existingTimer) {
    clearTimeout(existingTimer);
    reminderTimers.delete(Number(taskId));
  }
}

function scheduleReminderForTask(task) {
  clearReminderTimer(task.id);

  const triggerTime = new Date(task.reminderAt).getTime();
  const delay = triggerTime - Date.now();

  if (delay <= 0 || task.reminderSent) {
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const latestTask = Task.getTaskById(task.id);
      if (!latestTask || latestTask.reminderSent) {
        clearReminderTimer(task.id);
        return;
      }

      await sendTaskReminderEmail(latestTask.email, latestTask.text, latestTask.reminderAt);
      Task.markReminderSent(latestTask.id);
      console.log(`✅ Reminder email sent to ${latestTask.email} for task #${latestTask.id}`);
    } catch (emailError) {
      console.warn('⚠️ Scheduled reminder email failed:', emailError.message);
      if (emailError.statusCode === 403) {
        console.warn('ℹ️ Resend test mode allows only your own inbox. Verify a domain and set RESEND_FROM_EMAIL in .env to send to multiple users.');
      }
    } finally {
      clearReminderTimer(task.id);
    }
  }, delay);

  reminderTimers.set(task.id, timer);
}

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask
};
