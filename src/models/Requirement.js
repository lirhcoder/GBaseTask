class Requirement {
  constructor(data) {
    this.id = data.record_id;
    this.fields = data.fields || {};
    this.title = this.fields['标题'] || this.fields['title'] || '';
    this.status = this.fields['状态'] || this.fields['status'] || '待开发';
    this.priority = this.fields['优先级'] || this.fields['priority'] || '中';
    this.assignee = this.fields['负责人'] || this.fields['assignee'] || '';
    this.createdAt = this.fields['创建时间'] || this.fields['created_at'] || new Date();
    this.description = this.fields['描述'] || this.fields['description'] || '';
    this.module = this.fields['模块'] || this.fields['module'] || '';
    this.type = this.fields['需求类型'] || this.fields['type'] || '功能需求';
    this.proposer = this.fields['提出人'] || this.fields['proposer'] || '';
    this.dueDate = this.fields['期望完成日期'] || this.fields['due_date'] || null;
    this.estimatedHours = this.fields['预估工时'] || this.fields['estimated_hours'] || 0;
    this.actualHours = this.fields['实际工时'] || this.fields['actual_hours'] || 0;
    this.tags = this.fields['标签'] || this.fields['tags'] || [];
  }

  toTask() {
    return {
      id: this.id,
      title: `[需求] ${this.title}`,
      type: 'requirement',
      status: this.mapStatus(this.status),
      priority: this.mapPriority(this.priority),
      assignee: this.assignee,
      description: this.description,
      dueDate: this.dueDate || this.calculateDueDate(),
      tags: [this.module, this.type].filter(Boolean),
      sourceId: this.id,
      sourceType: 'lark_requirement',
      metadata: {
        proposer: this.proposer,
        module: this.module,
        requirementType: this.type,
        estimatedHours: this.estimatedHours,
        actualHours: this.actualHours,
        originalStatus: this.status,
        originalPriority: this.priority
      }
    };
  }

  mapStatus(larkStatus) {
    const statusMap = {
      '待评审': 'pending_review',
      '待开发': 'pending',
      '开发中': 'in_progress',
      '待测试': 'testing',
      '已完成': 'completed',
      '已上线': 'deployed',
      '已取消': 'cancelled',
      '暂缓': 'on_hold'
    };
    return statusMap[larkStatus] || 'pending';
  }

  reverseMapStatus(taskStatus) {
    const statusMap = {
      'pending_review': '待评审',
      'pending': '待开发',
      'in_progress': '开发中',
      'testing': '待测试',
      'completed': '已完成',
      'deployed': '已上线',
      'cancelled': '已取消',
      'on_hold': '暂缓'
    };
    return statusMap[taskStatus] || '待开发';
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
      '紧急': 7,
      '高': 14,
      '中': 30,
      '低': 60
    };
    const days = priorityDays[this.priority] || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  static fromTask(task) {
    const fields = {
      '标题': task.title.replace('[需求] ', ''),
      '状态': new Requirement({}).reverseMapStatus(task.status),
      '优先级': task.metadata?.originalPriority || '中',
      '负责人': task.assignee || '',
      '描述': task.description || '',
      '模块': task.metadata?.module || '',
      '需求类型': task.metadata?.requirementType || '功能需求',
      '提出人': task.metadata?.proposer || '',
      '期望完成日期': task.dueDate || null,
      '预估工时': task.metadata?.estimatedHours || 0,
      '实际工时': task.metadata?.actualHours || 0,
      '标签': task.tags || []
    };
    return fields;
  }
}

module.exports = Requirement;