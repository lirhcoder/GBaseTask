/**
 * 模型适配器 - 根据运行环境选择正确的模型
 */

// 检测当前运行的是哪个版本
const isSQLite = process.argv[1] && process.argv[1].includes('index-sqlite.js');

// 动态选择模型
const getModel = (modelName) => {
  if (isSQLite) {
    switch (modelName) {
      case 'User':
        return require('../models/User-sqlite');
      case 'Task':
        return require('../models/Task-sqlite');
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  } else {
    switch (modelName) {
      case 'User':
        return require('../models/User');
      case 'Task':
        return require('../models/Task');
      case 'Bug':
        return require('../models/Bug');
      case 'Requirement':
        return require('../models/Requirement');
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  }
};

module.exports = {
  User: getModel('User'),
  Task: getModel('Task'),
  Bug: isSQLite ? null : getModel('Bug'),
  Requirement: isSQLite ? null : getModel('Requirement'),
  isSQLite
};