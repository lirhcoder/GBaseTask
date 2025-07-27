const express = require('express');
const router = express.Router();
// 根据环境选择正确的认证中间件
const isSQLite = process.argv[1] && process.argv[1].includes('index-sqlite.js');
const { authenticate } = require(isSQLite ? '../middleware/auth-sqlite' : '../middleware/auth');

let syncService = null;

const setSyncService = (ss) => {
  syncService = ss;
};

router.post('/manual', authenticate, async (req, res) => {
  try {
    const result = await syncService.performSync();
    res.json(result);
  } catch (error) {
    console.error('手动同步失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/bugs', authenticate, async (req, res) => {
  try {
    const result = await syncService.syncBugsOnly();
    res.json(result);
  } catch (error) {
    console.error('同步 Bug 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/requirements', authenticate, async (req, res) => {
  try {
    const result = await syncService.syncRequirementsOnly();
    res.json(result);
  } catch (error) {
    console.error('同步需求失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/all', authenticate, async (req, res) => {
  try {
    const result = await syncService.performSync();
    res.json(result);
  } catch (error) {
    console.error('同步所有数据失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', (req, res) => {
  try {
    const status = syncService.getSyncStatus();
    res.json(status);
  } catch (error) {
    console.error('获取同步状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = syncService.getSyncHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('获取同步历史失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/schedule', (req, res) => {
  try {
    const { cronExpression } = req.body;
    if (!cronExpression) {
      return res.status(400).json({ error: 'cronExpression 不能为空' });
    }
    
    syncService.updateCronExpression(cronExpression);
    res.json({ 
      success: true, 
      message: `同步计划已更新为: ${cronExpression}` 
    });
  } catch (error) {
    console.error('更新同步计划失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/stop', (req, res) => {
  try {
    syncService.stop();
    res.json({ success: true, message: '同步服务已停止' });
  } catch (error) {
    console.error('停止同步服务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/start', (req, res) => {
  try {
    const { cronExpression } = req.body;
    syncService.start(cronExpression);
    res.json({ 
      success: true, 
      message: '同步服务已启动',
      cronExpression: cronExpression || '0 */30 * * * *'
    });
  } catch (error) {
    console.error('启动同步服务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, setSyncService };