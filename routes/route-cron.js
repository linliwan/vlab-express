import express from 'express';
import { adminNavItems } from '../config.js';
import crontask from '../crontask/crontask.js';

const router = express.Router();

// Get all task lists and their statuses
router.get('/tasks', async (req, res) => {
    const tasks = crontask.getAllTasks();
    res.render('admin.ejs', {
        navItems: adminNavItems,
        content: './content/cron/tasks.ejs',
        tasks: tasks
    });
});

// API to toggle task status
router.post('/tasks/:taskId/toggle', (req, res) => {
  const { taskId } = req.params;
  
  try {
    const newStatus = crontask.toggleTask(taskId);
    res.json({ 
      success: true, 
      taskId, 
      status: newStatus ? 'Running' : 'Stopped', 
      isRunning: newStatus 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
