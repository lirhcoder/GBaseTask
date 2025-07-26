const Task = require('../models/Task-sqlite');
const LarkNotificationService = require('./larkNotification');

class TaskSystem {
  constructor(larkClient) {
    this.larkClient = larkClient;
    this.notificationService = new LarkNotificationService(larkClient);
  }

  async getTasks(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;
      
      // 构建查询条件
      const where = {};
      if (filter.status) where.status = filter.status;
      if (filter.priority) where.priority = filter.priority;
      if (filter.assignee) where.assignee = filter.assignee;
      if (filter.type) where.type = filter.type;
      
      // 查询任务
      const tasks = await Task.findAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      // 获取总数
      const total = await Task.count({ where });
      
      return {
        tasks,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const task = await Task.create({
        ...taskData,
        id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      // 发送通知
      if (taskData.assignee) {
        await this.notificationService.sendTaskAssignment(task);
      }
      
      return task;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('任务不存在');
      }
      
      const oldAssignee = task.assignee;
      await task.update(updates);
      
      // 如果负责人变更，发送通知
      if (updates.assignee && updates.assignee !== oldAssignee) {
        await this.notificationService.sendTaskAssignment(task);
      }
      
      // 如果状态变更为完成，发送通知
      if (updates.status === 'closed' && task.status !== 'closed') {
        await this.notificationService.sendTaskCompletion(task);
      }
      
      return task;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('任务不存在');
      }
      
      await task.destroy();
      return { success: true };
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  async getTaskById(taskId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('任务不存在');
      }
      return task;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw error;
    }
  }

  async syncBugsToTasks() {
    try {
      console.log('开始同步 Bug 数据...');
      
      const bugTableId = process.env.LARK_BUG_TABLE_ID;
      const appToken = this.extractAppToken(bugTableId);
      
      const bugRecords = await this.larkClient.getTableRecords(appToken, bugTableId);
      
      if (!bugRecords || !bugRecords.items) {
        console.log('没有找到 Bug 记录');
        return { synced: 0, errors: 0, timestamp: new Date() };
      }

      let synced = 0;
      let errors = 0;

      for (const record of bugRecords.items) {
        try {
          const bugData = this.parseBugRecord(record);
          
          // 查找或创建任务
          let task = await Task.findOne({ where: { larkId: bugData.larkId } });
          
          if (task) {
            // 更新现有任务
            await task.update({
              title: bugData.title,
              description: bugData.description,
              status: bugData.status,
              priority: bugData.priority,
              assignee: bugData.assignee,
              larkRecordId: record.record_id
            });
          } else {
            // 创建新任务
            await Task.create({
              id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: bugData.title,
              description: bugData.description,
              type: 'bug',
              status: bugData.status,
              priority: bugData.priority,
              assignee: bugData.assignee,
              larkId: bugData.larkId,
              larkRecordId: record.record_id,
              source: 'lark'
            });
          }
          
          synced++;
        } catch (error) {
          console.error('同步 Bug 记录失败:', error);
          errors++;
        }
      }

      console.log(`Bug 同步完成: 成功 ${synced}, 失败 ${errors}`);
      return { synced, errors, timestamp: new Date() };
    } catch (error) {
      console.error('同步 Bug 失败:', error);
      throw error;
    }
  }

  async syncRequirementsToTasks() {
    try {
      console.log('开始同步需求数据...');
      
      const reqTableId = process.env.LARK_REQUIREMENT_TABLE_ID;
      const appToken = this.extractAppToken(reqTableId);
      
      const reqRecords = await this.larkClient.getTableRecords(appToken, reqTableId);
      
      if (!reqRecords || !reqRecords.items) {
        console.log('没有找到需求记录');
        return { synced: 0, errors: 0, timestamp: new Date() };
      }

      let synced = 0;
      let errors = 0;

      for (const record of reqRecords.items) {
        try {
          const reqData = this.parseRequirementRecord(record);
          
          // 查找或创建任务
          let task = await Task.findOne({ where: { larkId: reqData.larkId } });
          
          if (task) {
            // 更新现有任务
            await task.update({
              title: reqData.title,
              description: reqData.description,
              status: reqData.status,
              priority: reqData.priority,
              assignee: reqData.assignee,
              larkRecordId: record.record_id
            });
          } else {
            // 创建新任务
            await Task.create({
              id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: reqData.title,
              description: reqData.description,
              type: 'requirement',
              status: reqData.status,
              priority: reqData.priority,
              assignee: reqData.assignee,
              larkId: reqData.larkId,
              larkRecordId: record.record_id,
              source: 'lark'
            });
          }
          
          synced++;
        } catch (error) {
          console.error('同步需求记录失败:', error);
          errors++;
        }
      }

      console.log(`需求同步完成: 成功 ${synced}, 失败 ${errors}`);
      return { synced, errors, timestamp: new Date() };
    } catch (error) {
      console.error('同步需求失败:', error);
      throw error;
    }
  }

  parseBugRecord(record) {
    const fields = record.fields || {};
    return {
      larkId: fields['Bug ID'] || fields['编号'] || record.record_id,
      title: fields['标题'] || fields['Title'] || '未命名 Bug',
      description: fields['描述'] || fields['Description'] || '',
      status: this.mapStatus(fields['状态'] || fields['Status']),
      priority: this.mapPriority(fields['优先级'] || fields['Priority']),
      assignee: fields['负责人'] || fields['Assignee'] || ''
    };
  }

  parseRequirementRecord(record) {
    const fields = record.fields || {};
    return {
      larkId: fields['需求 ID'] || fields['编号'] || record.record_id,
      title: fields['标题'] || fields['Title'] || '未命名需求',
      description: fields['描述'] || fields['Description'] || '',
      status: this.mapStatus(fields['状态'] || fields['Status']),
      priority: this.mapPriority(fields['优先级'] || fields['Priority']),
      assignee: fields['负责人'] || fields['Assignee'] || ''
    };
  }

  mapStatus(larkStatus) {
    const statusMap = {
      '待处理': 'open',
      '进行中': 'in_progress',
      '已完成': 'closed',
      'To Do': 'open',
      'In Progress': 'in_progress',
      'Done': 'closed'
    };
    return statusMap[larkStatus] || 'open';
  }

  mapPriority(larkPriority) {
    const priorityMap = {
      '高': 'high',
      '中': 'medium',
      '低': 'low',
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low'
    };
    return priorityMap[larkPriority] || 'medium';
  }

  extractAppToken(tableId) {
    // 从表格 ID 中提取 app token
    // 这是一个简化的实现，实际可能需要更复杂的逻辑
    return process.env.LARK_APP_TOKEN || 'default_app_token';
  }

  async getTaskStatistics() {
    try {
      const stats = {
        total: await Task.count(),
        byStatus: {
          open: await Task.count({ where: { status: 'open' } }),
          in_progress: await Task.count({ where: { status: 'in_progress' } }),
          closed: await Task.count({ where: { status: 'closed' } })
        },
        byType: {
          bug: await Task.count({ where: { type: 'bug' } }),
          requirement: await Task.count({ where: { type: 'requirement' } }),
          task: await Task.count({ where: { type: 'task' } })
        },
        byPriority: {
          high: await Task.count({ where: { priority: 'high' } }),
          medium: await Task.count({ where: { priority: 'medium' } }),
          low: await Task.count({ where: { priority: 'low' } })
        }
      };
      
      return stats;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      throw error;
    }
  }
}

module.exports = TaskSystem;