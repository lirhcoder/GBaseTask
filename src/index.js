require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入服务和工具
const { connectDatabase } = require('./utils/database');
const LarkTableClient = require('./services/larkClient');
const TaskSystem = require('./services/taskSystem');
const SyncService = require('./services/syncService');

// 导入路由
const { router: tasksRouter, setTaskSystem } = require('./routes/tasks');
const { router: syncRouter, setSyncService } = require('./routes/sync');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: err.message 
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      lark: larkClient ? 'initialized' : 'not initialized',
      sync: syncService ? 'initialized' : 'not initialized'
    }
  });
});

// API 信息端点
app.get('/api', (req, res) => {
  res.json({
    name: 'Lark Task Management System',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      sync: '/api/sync',
      statistics: '/api/tasks/statistics'
    }
  });
});

// 初始化服务
let larkClient = null;
let taskSystem = null;
let syncService = null;

async function initializeServices() {
  try {
    console.log('正在初始化服务...');
    
    // 连接数据库
    await connectDatabase();
    
    // 初始化 Lark 客户端
    larkClient = new LarkTableClient(
      process.env.LARK_APP_ID,
      process.env.LARK_APP_SECRET
    );
    await larkClient.initialize();
    console.log('Lark 客户端初始化成功');
    
    // 初始化任务系统
    taskSystem = new TaskSystem(larkClient);
    setTaskSystem(taskSystem);
    console.log('任务系统初始化成功');
    
    // 初始化同步服务
    syncService = new SyncService(taskSystem);
    setSyncService(syncService);
    
    // 根据环境变量决定是否自动启动同步服务
    if (process.env.AUTO_SYNC !== 'false') {
      syncService.start('0 */30 * * * *'); // 每30分钟同步一次
      console.log('自动同步服务已启动');
    }
    
    console.log('所有服务初始化完成');
  } catch (error) {
    console.error('服务初始化失败:', error);
    process.exit(1);
  }
}

// 注册路由
app.use('/api/tasks', tasksRouter);
app.use('/api/sync', syncRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 引入 mongoose 用于健康检查
const mongoose = require('mongoose');

async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('API 文档: http://localhost:' + PORT + '/api');
    console.log('健康检查: http://localhost:' + PORT + '/health');
  });
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  
  if (syncService) {
    syncService.stop();
  }
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  console.log('服务器已关闭');
  process.exit(0);
});

// 启动应用
startServer().catch(console.error);