/**
 * Task Routes
 * REST API endpoints for task management
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

/**
 * GET /api/tasks
 * Retrieve all tasks
 */
router.get('/', taskController.getTasks);

/**
 * POST /api/tasks/add
 * Add a new task and send email reminder
 * Body: { text: string, email: string }
 */
router.post('/add', taskController.addTask);

/**
 * PUT /api/tasks/update
 * Update an existing task
 * Body: { id: number, text: string }
 */
router.put('/update', taskController.updateTask);

/**
 * DELETE /api/tasks/delete/:id
 * Delete a task by ID
 */
router.delete('/delete/:id', taskController.deleteTask);

module.exports = router;
