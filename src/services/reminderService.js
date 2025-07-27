const cron = require('node-cron');
const Task = require('../models/Task');

class ReminderService {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.reminderJobs = new Map();
  }

  // 启动提醒服务
  start() {
    console.log('启动任务提醒服务...');
    
    // 每天早上 9 点检查过期任务
    this.reminderJobs.set('overdue-morning', 
      cron.schedule('0 9 * * *', () => this.checkOverdueTasks())
    );
    
    // 每天下午 2 点再次检查
    this.reminderJobs.set('overdue-afternoon',
      cron.schedule('0 14 * * *', () => this.checkOverdueTasks())
    );
    
    // 每天早上 8:30 发送今日任务提醒
    this.reminderJobs.set('daily-tasks',
      cron.schedule('30 8 * * *', () => this.sendDailyTasksReminder())
    );
    
    // 每周一早上 9 点发送周报
    this.reminderJobs.set('weekly-report',
      cron.schedule('0 9 * * 1', () => this.sendWeeklyReport())
    );

    console.log('任务提醒服务已启动');
  }

  // 停止提醒服务
  stop() {
    this.reminderJobs.forEach((job, name) => {
      job.stop();
      console.log(`停止定时任务: ${name}`);
    });
    this.reminderJobs.clear();
    console.log('任务提醒服务已停止');
  }

  // 检查过期任务
  async checkOverdueTasks() {
    try {
      console.log('检查过期任务...');
      
      const overdueTasks = await Task.find({
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'closed', 'cancelled'] }
      }).sort({ dueDate: 1 });

      if (overdueTasks.length > 0) {
        console.log(`发现 ${overdueTasks.length} 个过期任务`);
        await this.notificationService.notifyOverdueTasks(overdueTasks);
      }
    } catch (error) {
      console.error('检查过期任务失败:', error);
    }
  }

  // 发送今日任务提醒
  async sendDailyTasksReminder() {
    try {
      console.log('准备发送今日任务提醒...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 查找今日到期的任务
      const todayTasks = await Task.find({
        dueDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: { $nin: ['completed', 'closed', 'cancelled'] }
      }).populate('assignee', 'displayName email');

      if (todayTasks.length === 0) {
        console.log('今日没有到期任务');
        return;
      }

      // 按负责人分组
      const tasksByAssignee = this.groupTasksByAssignee(todayTasks);
      
      // 为每个负责人发送提醒
      for (const [assignee, tasks] of tasksByAssignee.entries()) {
        await this.sendDailyReminderToUser(assignee, tasks);
      }
    } catch (error) {
      console.error('发送今日任务提醒失败:', error);
    }
  }

  // 发送周报
  async sendWeeklyReport() {
    try {
      console.log('准备发送周报...');
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 统计本周数据
      const [
        completedTasks,
        createdTasks,
        overdueTasks,
        inProgressTasks
      ] = await Promise.all([
        Task.countDocuments({
          completedAt: { $gte: oneWeekAgo },
          status: { $in: ['completed', 'closed'] }
        }),
        Task.countDocuments({
          createdAt: { $gte: oneWeekAgo }
        }),
        Task.countDocuments({
          dueDate: { $lt: new Date() },
          status: { $nin: ['completed', 'closed', 'cancelled'] }
        }),
        Task.countDocuments({
          status: 'in_progress'
        })
      ]);

      const card = this.buildWeeklyReportCard({
        completedTasks,
        createdTasks,
        overdueTasks,
        inProgressTasks,
        weekStart: oneWeekAgo,
        weekEnd: new Date()
      });

      await this.notificationService.sendCardMessage(card);
    } catch (error) {
      console.error('发送周报失败:', error);
    }
  }

  // 为用户发送每日提醒
  async sendDailyReminderToUser(assignee, tasks) {
    const card = {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**${assignee || '未分配'}**, 您今天有 **${tasks.length}** 个任务到期：`,
            tag: 'lark_md'
          }
        },
        ...tasks.map((task, index) => ({
          tag: 'div',
          text: {
            content: `${index + 1}. **${task.title}** - ${this.getPriorityText(task.priority)}`,
            tag: 'lark_md'
          }
        })),
        {
          tag: 'hr'
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看所有任务',
                tag: 'plain_text'
              },
              type: 'primary',
              url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/tasks?assignee=${encodeURIComponent(assignee)}`
            }
          ]
        }
      ],
      header: {
        template: 'blue',
        title: {
          content: '📅 今日任务提醒',
          tag: 'plain_text'
        }
      }
    };

    await this.notificationService.sendCardMessage(card);
  }

  // 构建周报卡片
  buildWeeklyReportCard(stats) {
    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**统计周期**: ${stats.weekStart.toLocaleDateString('zh-CN')} - ${stats.weekEnd.toLocaleDateString('zh-CN')}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: '**本周任务完成情况**',
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          fields: [
            {
              is_short: true,
              text: {
                content: `**新建任务**\n${stats.createdTasks} 个`,
                tag: 'lark_md'
              }
            },
            {
              is_short: true,
              text: {
                content: `**完成任务**\n${stats.completedTasks} 个`,
                tag: 'lark_md'
              }
            }
          ]
        },
        {
          tag: 'div',
          fields: [
            {
              is_short: true,
              text: {
                content: `**进行中**\n${stats.inProgressTasks} 个`,
                tag: 'lark_md'
              }
            },
            {
              is_short: true,
              text: {
                content: `**已过期**\n${stats.overdueTasks} 个`,
                tag: 'lark_md'
              }
            }
          ]
        },
        {
          tag: 'hr'
        },
        {
          tag: 'div',
          text: {
            content: `完成率: **${stats.createdTasks > 0 ? Math.round((stats.completedTasks / stats.createdTasks) * 100) : 0}%**`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看详细报表',
                tag: 'plain_text'
              },
              type: 'primary',
              url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reports`
            }
          ]
        }
      ],
      header: {
        template: 'purple',
        title: {
          content: '📊 周任务报告',
          tag: 'plain_text'
        }
      }
    };
  }

  // 按负责人分组任务
  groupTasksByAssignee(tasks) {
    const grouped = new Map();
    
    for (const task of tasks) {
      const assignee = task.assignee || '未分配';
      if (!grouped.has(assignee)) {
        grouped.set(assignee, []);
      }
      grouped.get(assignee).push(task);
    }
    
    return grouped;
  }

  // 获取优先级文本
  getPriorityText(priority) {
    const priorityMap = {
      urgent: '🔴 紧急',
      high: '🟠 高',
      medium: '🟡 中',
      low: '🟢 低'
    };
    return priorityMap[priority] || priority;
  }

  // 手动触发提醒
  async triggerReminder(type) {
    switch (type) {
      case 'overdue':
        await this.checkOverdueTasks();
        break;
      case 'daily':
        await this.sendDailyTasksReminder();
        break;
      case 'weekly':
        await this.sendWeeklyReport();
        break;
      default:
        throw new Error(`未知的提醒类型: ${type}`);
    }
  }
}

module.exports = ReminderService;