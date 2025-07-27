const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const syncRoutes = require('./routes/sync');

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（用于测试页面）
app.use(express.static(path.join(__dirname, '..')));

// Lark OAuth 简化回调路由（备选方案）
app.all('/lark-callback', (req, res) => {
  const params = { ...req.query, ...req.body };
  const { challenge } = params;
  
  if (challenge) {
    console.log('Lark challenge 验证 (简化路由):', challenge);
    return res.json({ challenge });
  }
  
  // 转发到主回调处理
  req.url = '/api/auth/oauth/lark/callback';
  req.originalUrl = '/api/auth/oauth/lark/callback' + (req._parsedUrl.search || '');
  app.handle(req, res);
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sync', syncRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '路径不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;