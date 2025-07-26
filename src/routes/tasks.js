const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

let taskSystem = null;

const setTaskSystem = (ts) => {
  taskSystem = ts;
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, priority, assignee, type, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;

    const result = await taskSystem.getTasks(filter, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
    
    res.json(result);
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const stats = await taskSystem.getTaskStatistics();
    res.json(stats);
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/overdue', async (req, res) => {
  try {
    const tasks = await taskSystem.getOverdueTasks();
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error('获取过期任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await taskSystem.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json(task);
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('tasks', 'create'), async (req, res) => {
  try {
    const task = await taskSystem.createTask(req.body, req.user);
    res.status(201).json(task);
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('tasks', 'update'), async (req, res) => {
  try {
    const task = await taskSystem.updateTask(req.params.id, req.body, req.user);
    res.json(task);
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize('tasks', 'update'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: '状态不能为空' });
    }
    
    const task = await taskSystem.updateTaskStatus(req.params.id, status, req.user);
    res.json(task);
  } catch (error) {
    console.error('更新任务状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('tasks', 'delete'), async (req, res) => {
  try {
    const result = await taskSystem.deleteTask(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, setTaskSystem };