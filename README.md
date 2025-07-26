# Lark 任务管理系统

基于 Lark 多维表格的 Bug 和需求管理系统。

## 快速开始

1. 克隆项目并安装依赖
```bash
git clone <your-repo-url>
cd lark-task
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 Lark 应用凭证
```

3. 启动开发服务器
```bash
npm run dev
```

## 功能特性

- 自动同步 Lark 多维表格中的 Bug 数据
- 任务状态双向同步
- RESTful API 接口
- 定时同步机制
- 任务优先级管理

## 详细文档

请参考 [开发文档.md](./开发文档.md) 获取详细的实现说明。

## License

MIT