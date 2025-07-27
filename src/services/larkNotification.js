const axios = require('axios');

class LarkNotificationService {
  constructor(larkClient) {
    this.larkClient = larkClient;
    this.webhookUrl = process.env.LARK_WEBHOOK_URL;
    this.botAppId = process.env.LARK_BOT_APP_ID;
    this.botAppSecret = process.env.LARK_BOT_APP_SECRET;
  }

  // 发送 Webhook 消息
  async sendWebhookMessage(content) {
    if (!this.webhookUrl) {
      console.warn('飞书 Webhook URL 未配置');
      return false;
    }

    try {
      const response = await axios.post(this.webhookUrl, content);
      return response.data;
    } catch (error) {
      console.error('发送飞书 Webhook 消息失败:', error);
      throw error;
    }
  }

  // 发送文本消息
  async sendTextMessage(text) {
    const content = {
      msg_type: 'text',
      content: {
        text
      }
    };
    return this.sendWebhookMessage(content);
  }

  // 发送富文本消息
  async sendRichMessage(title, content) {
    const message = {
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title,
            content
          }
        }
      }
    };
    return this.sendWebhookMessage(message);
  }

  // 发送卡片消息
  async sendCardMessage(card) {
    const message = {
      msg_type: 'interactive',
      card
    };
    return this.sendWebhookMessage(message);
  }

  // 构建任务创建通知卡片
  buildTaskCreatedCard(task, creator) {
    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**任务标题**: ${task.title}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**任务类型**: ${this.getTaskTypeText(task.type)}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**优先级**: ${this.getPriorityText(task.priority)}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**负责人**: ${task.assignee || '未分配'}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**截止日期**: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '未设置'}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `创建人: ${creator.displayName} | 创建时间: ${new Date().toLocaleString('zh-CN')}`
            }
          ]
        }
      ],
      header: {
        template: 'blue',
        title: {
          content: '🆕 新任务创建',
          tag: 'plain_text'
        }
      }
    };
  }

  // 构建任务状态更新通知卡片
  buildTaskStatusUpdateCard(task, oldStatus, newStatus, updater) {
    const statusColor = this.getStatusColor(newStatus);
    
    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**任务标题**: ${task.title}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**状态变更**: ${this.getStatusText(oldStatus)} → ${this.getStatusText(newStatus)}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**当前负责人**: ${task.assignee || '未分配'}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `更新人: ${updater.displayName} | 更新时间: ${new Date().toLocaleString('zh-CN')}`
            }
          ]
        }
      ],
      header: {
        template: statusColor,
        title: {
          content: '📝 任务状态更新',
          tag: 'plain_text'
        }
      }
    };
  }

  // 构建任务分配通知卡片
  buildTaskAssignedCard(task, assignee, assigner) {
    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**${assignee.displayName}**, 您有新的任务分配！`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**任务标题**: ${task.title}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**任务类型**: ${this.getTaskTypeText(task.type)}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**优先级**: ${this.getPriorityText(task.priority)}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `**截止日期**: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '未设置'}`,
            tag: 'lark_md'
          }
        },
        task.description && {
          tag: 'div',
          text: {
            content: `**任务描述**: ${task.description}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看任务详情',
                tag: 'plain_text'
              },
              type: 'primary',
              url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/tasks/${task.id}`
            }
          ]
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `分配人: ${assigner.displayName} | 分配时间: ${new Date().toLocaleString('zh-CN')}`
            }
          ]
        }
      ].filter(Boolean),
      header: {
        template: 'orange',
        title: {
          content: '👤 任务分配通知',
          tag: 'plain_text'
        }
      }
    };
  }

  // 构建过期任务提醒卡片
  buildOverdueTasksCard(tasks) {
    const taskElements = tasks.slice(0, 5).map(task => ({
      tag: 'div',
      text: {
        content: `• **${task.title}** - 负责人: ${task.assignee || '未分配'} - 已过期 ${this.getDaysOverdue(task.dueDate)} 天`,
        tag: 'lark_md'
      }
    }));

    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `发现 **${tasks.length}** 个过期任务需要处理：`,
            tag: 'lark_md'
          }
        },
        ...taskElements,
        tasks.length > 5 && {
          tag: 'div',
          text: {
            content: `... 还有 ${tasks.length - 5} 个任务`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看所有过期任务',
                tag: 'plain_text'
              },
              type: 'danger',
              url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/tasks?status=overdue`
            }
          ]
        }
      ].filter(Boolean),
      header: {
        template: 'red',
        title: {
          content: '⚠️ 过期任务提醒',
          tag: 'plain_text'
        }
      }
    };
  }

  // 构建同步完成通知卡片
  buildSyncCompletedCard(result) {
    const { bugs, requirements, total } = result;
    
    return {
      config: {
        wide_screen_mode: true
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**同步完成时间**: ${new Date(result.timestamp).toLocaleString('zh-CN')}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: '**同步结果统计**:',
            tag: 'lark_md'
          }
        },
        bugs && {
          tag: 'div',
          text: {
            content: `• Bug 同步: 成功 ${bugs.synced || 0} 条, 失败 ${bugs.errors || 0} 条`,
            tag: 'lark_md'
          }
        },
        requirements && {
          tag: 'div',
          text: {
            content: `• 需求同步: 成功 ${requirements.synced || 0} 条, 失败 ${requirements.errors || 0} 条`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: `• **总计**: 同步 ${total.synced} 条记录, ${total.errors} 个错误`,
            tag: 'lark_md'
          }
        },
        total.errors > 0 && {
          tag: 'div',
          text: {
            content: '⚠️ 存在同步错误，请检查日志',
            tag: 'lark_md'
          }
        }
      ].filter(Boolean),
      header: {
        template: total.errors > 0 ? 'orange' : 'green',
        title: {
          content: '🔄 数据同步完成',
          tag: 'plain_text'
        }
      }
    };
  }

  // 发送通知给用户
  async notifyUser(userId, card) {
    try {
      // 如果配置了 Webhook，使用 Webhook 发送
      if (this.webhookUrl) {
        return await this.sendCardMessage(card);
      }
      
      // TODO: 实现通过飞书 API 发送私聊消息
      console.log('向用户发送通知:', userId, card);
    } catch (error) {
      console.error('发送用户通知失败:', error);
    }
  }

  // 辅助方法
  getTaskTypeText(type) {
    const typeMap = {
      bug: '🐛 Bug',
      requirement: '📋 需求',
      task: '📌 任务',
      other: '📄 其他'
    };
    return typeMap[type] || type;
  }

  getPriorityText(priority) {
    const priorityMap = {
      urgent: '🔴 紧急',
      high: '🟠 高',
      medium: '🟡 中',
      low: '🟢 低'
    };
    return priorityMap[priority] || priority;
  }

  getStatusText(status) {
    const statusMap = {
      pending: '待处理',
      pending_review: '待评审',
      in_progress: '进行中',
      testing: '测试中',
      resolved: '已解决',
      completed: '已完成',
      deployed: '已部署',
      closed: '已关闭',
      reopened: '重新打开',
      cancelled: '已取消',
      on_hold: '暂缓',
      cannot_reproduce: '无法复现',
      deferred: '延期'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      pending: 'grey',
      in_progress: 'blue',
      completed: 'green',
      closed: 'green',
      cancelled: 'grey',
      reopened: 'orange',
      urgent: 'red'
    };
    return colorMap[status] || 'blue';
  }

  getDaysOverdue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // 批量通知方法
  async notifyTaskCreated(task, creator) {
    const card = this.buildTaskCreatedCard(task, creator);
    await this.sendCardMessage(card);
  }

  async notifyTaskStatusUpdate(task, oldStatus, newStatus, updater) {
    const card = this.buildTaskStatusUpdateCard(task, oldStatus, newStatus, updater);
    await this.sendCardMessage(card);
  }

  async notifyTaskAssigned(task, assignee, assigner) {
    const card = this.buildTaskAssignedCard(task, assignee, assigner);
    await this.notifyUser(assignee.larkUserId, card);
  }

  async notifyOverdueTasks(tasks) {
    if (tasks.length === 0) return;
    const card = this.buildOverdueTasksCard(tasks);
    await this.sendCardMessage(card);
  }

  async notifySyncCompleted(result) {
    const card = this.buildSyncCompletedCard(result);
    await this.sendCardMessage(card);
  }
}

module.exports = LarkNotificationService;