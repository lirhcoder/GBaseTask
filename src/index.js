require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('使用 /health 端点检查服务状态');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  process.exit(0);
});