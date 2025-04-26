import cron from 'node-cron';

// Task manager
class CronTaskManager {
  constructor() {
    this.tasks = {};
    this.taskStatus = {};
  }

  // Register task
  registerTask(taskId, cronExpression, taskFunction, description) {
    // Store task information, but do not schedule immediately
    this.tasks[taskId] = {
      id: taskId,
      expression: cronExpression,
      fn: taskFunction,
      description: description,
      job: null
    };
    
    // Default task is off
    this.taskStatus[taskId] = false;
  }

  // Start task
  startTask(taskId) {
    const task = this.tasks[taskId];
    if (!task) {
      throw new Error(`Task ${taskId} does not exist`);
    }

    if (task.job) {
      // Task is already running
      return;
    }

    task.job = cron.schedule(task.expression, task.fn);
    this.taskStatus[taskId] = true;
    console.log(`Task ${taskId} started, job content: ${task.description}`);
  }

  // Stop task
  stopTask(taskId) {
    const task = this.tasks[taskId];
    if (!task || !task.job) {
      return;
    }

    task.job.stop();
    task.job = null;
    this.taskStatus[taskId] = false;
    console.log(`Task ${taskId} stopped, job content: ${task.description}`);
  }

  // Get task status
  getTaskStatus(taskId) {
    return this.taskStatus[taskId] || false;
  }

  // Get all task information
  getAllTasks() {
    return Object.keys(this.tasks).map(taskId => ({
      id: taskId,
      description: this.tasks[taskId].description,
      expression: this.tasks[taskId].expression,
      isRunning: this.taskStatus[taskId]
    }));
  }

  // Toggle task status
  toggleTask(taskId) {
    if (this.getTaskStatus(taskId)) {
      this.stopTask(taskId);
    } else {
      this.startTask(taskId);
    }
    return this.getTaskStatus(taskId);
  }
}

export default CronTaskManager;