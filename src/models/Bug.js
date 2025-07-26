class Bug {
  constructor(data) {
    this.id = data.record_id;
    this.fields = data.fields || {};
    this.title = this.fields['标题'] || this.fields['title'] || '';
    this.status = this.fields['状态'] || this.fields['status'] || '待处理';
    this.priority = this.fields['优先级'] || this.fields['priority'] || '中';
    this.assignee = this.fields['负责人'] || this.fields['assignee'] || '';
    this.createdAt = this.fields['创建时间'] || this.fields['created_at'] || new Date();
    this.description = this.fields['描述'] || this.fields['description'] || '';
    this.module = this.fields['模块'] || this.fields['module'] || '';
    this.severity = this.fields['严重程度'] || this.fields['severity'] || '中';
    this.reporter = this.fields['报告人'] || this.fields['reporter'] || '';
    this.dueDate = this.fields['截止日期'] || this.fields['due_date'] || null;
    this.tags = this.fields['标签'] || this.fields['tags'] || [];
  }

  toTask() {
    return {
      id: this.id,
      title: `[BUG] ${this.title}`,
      type: 'bug',
      status: this.mapStatus(this.status),
      priority: this.mapPriority(this.priority),
      assignee: this.assignee,
      description: this.description,
      dueDate: this.dueDate || this.calculateDueDate(),
      tags: [this.module, this.severity].filter(Boolean),
      sourceId: this.id,
      sourceType: 'lark_bug',
      metadata: {
        reporter: this.reporter,
        module: this.module,
        severity: this.severity,
        originalStatus: this.status,
        originalPriority: this.priority
      }
    };
  }

  mapStatus(larkStatus) {
    const statusMap = {
      '待处理': 'pending',
      '处理中': 'in_progress',
      '已修复': 'resolved',
      '已关闭': 'closed',
      '重新打开': 'reopened',
      '待验证': 'testing',
      '无法复现': 'cannot_reproduce',
      '延期': 'deferred'
    };
    return statusMap[larkStatus] || 'pending';
  }

  reverseMapStatus(taskStatus) {
    const statusMap = {
      'pending': '待处理',
      'in_progress': '处理中',
      'resolved': '已修复',
      'closed': '已关闭',
      'reopened': '重新打开',
      'testing': '待验证',
      'cannot_reproduce': '无法复现',
      'deferred': '延期'
    };
    return statusMap[taskStatus] || '待处理';
  }

  mapPriority(larkPriority) {
    const priorityMap = {
      '紧急': 'urgent',
      '高': 'high',
      '中': 'medium',
      '低': 'low'
    };
    return priorityMap[larkPriority] || 'medium';
  }

  calculateDueDate() {
    const priorityDays = {
      '紧急': 1,
      '高': 3,
      '中': 7,
      '低': 14
    };
    const days = priorityDays[this.priority] || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  static fromTask(task) {
    const fields = {
      '标题': task.title.replace('[BUG] ', ''),
      '状态': new Bug({}).reverseMapStatus(task.status),
      '优先级': task.metadata?.originalPriority || '中',
      '负责人': task.assignee || '',
      '描述': task.description || '',
      '模块': task.metadata?.module || '',
      '严重程度': task.metadata?.severity || '中',
      '报告人': task.metadata?.reporter || '',
      '截止日期': task.dueDate || null,
      '标签': task.tags || []
    };
    return fields;
  }
}

module.exports = Bug;