const Bug = require('../models/Bug');
const Requirement = require('../models/Requirement');
const Task = require('../models/Task');
const LarkNotificationService = require('./larkNotification');

class TaskSystem {
  constructor(larkClient) {
    this.larkClient = larkClient;
    this.notificationService = new LarkNotificationService(larkClient);
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
          const bug = new Bug(record);
          const taskData = bug.toTask();
          
          await Task.findOneAndUpdate(
            { sourceId: taskData.sourceId, sourceType: taskData.sourceType },
            { 
              ...taskData,
              syncedAt: new Date()
            },
            { upsert: true, new: true }
          );
          
          synced++;
        } catch (error) {
          console.error(`同步 Bug ${record.record_id} 失败:`, error);
          errors++;
        }
      }

      console.log(`Bug 同步完成: 成功 ${synced} 条, 失败 ${errors} 条`);
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
          const requirement = new Requirement(record);
          const taskData = requirement.toTask();
          
          await Task.findOneAndUpdate(
            { sourceId: taskData.sourceId, sourceType: taskData.sourceType },
            { 
              ...taskData,
              syncedAt: new Date()
            },
            { upsert: true, new: true }
          );
          
          synced++;
        } catch (error) {
          console.error(`同步需求 ${record.record_id} 失败:`, error);
          errors++;
        }
      }

      console.log(`需求同步完成: 成功 ${synced} 条, 失败 ${errors} 条`);
      return { synced, errors, timestamp: new Date() };
    } catch (error) {
      console.error('同步需求失败:', error);
      throw error;
    }
  }

  async syncAllToTasks() {
    const results = {
      bugs: null,
      requirements: null,
      total: { synced: 0, errors: 0 },
      timestamp: new Date()
    };

    try {
      results.bugs = await this.syncBugsToTasks();
      results.total.synced += results.bugs.synced;
      results.total.errors += results.bugs.errors;
    } catch (error) {
      console.error('Bug 同步失败:', error);
      results.bugs = { error: error.message };
    }

    try {
      results.requirements = await this.syncRequirementsToTasks();
      results.total.synced += results.requirements.synced;
      results.total.errors += results.requirements.errors;
    } catch (error) {
      console.error('需求同步失败:', error);
      results.requirements = { error: error.message };
    }

    return results;
  }

  async createTask(taskData, creator = null) {
    const task = new Task({
      ...taskData,
      id: taskData.id || this.generateTaskId(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await task.save();
    
    if (task.sourceType === 'lark_bug') {
      await this.updateBugInLark(task);
    } else if (task.sourceType === 'lark_requirement') {
      await this.updateRequirementInLark(task);
    }
    
    // 发送创建通知
    if (creator && this.notificationService) {
      try {
        await this.notificationService.notifyTaskCreated(task, creator);
      } catch (error) {
        console.error('发送任务创建通知失败:', error);
      }
    }
    
    return task;
  }

  async updateTaskStatus(taskId, newStatus, updater = null) {
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      throw new Error('任务不存在');
    }

    const oldStatus = task.status;
    task.updateStatus(newStatus);
    await task.save();

    if (task.sourceType === 'lark_bug') {
      await this.updateBugInLark(task);
    } else if (task.sourceType === 'lark_requirement') {
      await this.updateRequirementInLark(task);
    }

    // 发送状态更新通知
    if (updater && this.notificationService && oldStatus !== newStatus) {
      try {
        await this.notificationService.notifyTaskStatusUpdate(task, oldStatus, newStatus, updater);
      } catch (error) {
        console.error('发送状态更新通知失败:', error);
      }
    }

    return task;
  }

  async updateBugInLark(task) {
    try {
      const bugTableId = process.env.LARK_BUG_TABLE_ID;
      const appToken = this.extractAppToken(bugTableId);
      const fields = Bug.fromTask(task);
      
      await this.larkClient.updateRecord(
        appToken,
        bugTableId,
        task.sourceId,
        fields
      );
    } catch (error) {
      console.error('更新 Lark Bug 失败:', error);
      throw error;
    }
  }

  async updateRequirementInLark(task) {
    try {
      const reqTableId = process.env.LARK_REQUIREMENT_TABLE_ID;
      const appToken = this.extractAppToken(reqTableId);
      const fields = Requirement.fromTask(task);
      
      await this.larkClient.updateRecord(
        appToken,
        reqTableId,
        task.sourceId,
        fields
      );
    } catch (error) {
      console.error('更新 Lark 需求失败:', error);
      throw error;
    }
  }

  async getTasks(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getTaskById(taskId) {
    return await Task.findOne({ id: taskId });
  }

  async updateTask(taskId, updates, updater = null) {
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      throw new Error('任务不存在');
    }

    const oldAssignee = task.assignee;
    Object.assign(task, updates, { updatedAt: new Date() });
    await task.save();

    if (task.sourceType === 'lark_bug') {
      await this.updateBugInLark(task);
    } else if (task.sourceType === 'lark_requirement') {
      await this.updateRequirementInLark(task);
    }

    // 如果负责人变更，发送分配通知
    if (updater && this.notificationService && updates.assignee && updates.assignee !== oldAssignee) {
      try {
        // 这里需要获取被分配人的用户信息
        const assigneeUser = { displayName: updates.assignee, larkUserId: null }; // 简化处理
        await this.notificationService.notifyTaskAssigned(task, assigneeUser, updater);
      } catch (error) {
        console.error('发送任务分配通知失败:', error);
      }
    }

    return task;
  }

  async deleteTask(taskId) {
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.sourceType && task.sourceType !== 'manual') {
      throw new Error('不能删除来自 Lark 的任务');
    }

    await task.deleteOne();
    return { success: true };
  }

  async getTaskStatistics() {
    return await Task.getStatistics();
  }

  async getOverdueTasks() {
    const tasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'closed', 'cancelled'] }
    }).sort({ dueDate: 1 });

    return tasks;
  }

  extractAppToken(tableId) {
    // 从表格 ID 中提取 app token
    // 这里需要根据实际的 Lark 表格 ID 格式来调整
    // 通常 app token 是表格 URL 的一部分
    // 暂时返回表格 ID，实际使用时需要调整
    return tableId;
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = TaskSystem;