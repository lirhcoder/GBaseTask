const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database-sqlite');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('bug', 'requirement', 'task', 'other'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 'pending_review', 'in_progress', 'testing', 
      'resolved', 'completed', 'deployed', 'closed', 
      'reopened', 'cancelled', 'on_hold', 'cannot_reproduce', 'deferred'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('urgent', 'high', 'medium', 'low'),
    defaultValue: 'medium'
  },
  assignee: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  sourceId: {
    type: DataTypes.STRING,
    field: 'source_id'
  },
  sourceType: {
    type: DataTypes.ENUM('lark_bug', 'lark_requirement', 'manual', 'other'),
    field: 'source_type'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  syncedAt: {
    type: DataTypes.DATE,
    field: 'synced_at'
  }
}, {
  tableName: 'tasks',
  indexes: [
    { fields: ['status'] },
    { fields: ['assignee'] },
    { fields: ['priority'] },
    { fields: ['type'] },
    { fields: ['source_id', 'source_type'] },
    { fields: ['created_at'] },
    { fields: ['due_date'] }
  ]
});

// 实例方法
Task.prototype.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate && 
    !['completed', 'closed', 'cancelled'].includes(this.status);
};

Task.prototype.getDaysUntilDue = function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

Task.prototype.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (['completed', 'closed', 'resolved'].includes(newStatus)) {
    this.completedAt = new Date();
  } else if (['reopened', 'in_progress'].includes(newStatus)) {
    this.completedAt = null;
  }
};

// 静态方法
Task.getStatistics = async function() {
  const { Op } = require('sequelize');
  
  const [
    statusStats,
    priorityStats,
    typeStats,
    overdueCount,
    assigneeStats
  ] = await Promise.all([
    Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    }),
    Task.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    }),
    Task.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    }),
    Task.count({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['completed', 'closed', 'cancelled'] }
      }
    }),
    Task.findAll({
      attributes: [
        'assignee',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        assignee: { [Op.ne]: '' }
      },
      group: ['assignee'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    })
  ]);

  const total = await Task.count();

  return {
    byStatus: statusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.getDataValue('count'));
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc, item) => {
      acc[item.priority] = parseInt(item.getDataValue('count'));
      return acc;
    }, {}),
    byType: typeStats.reduce((acc, item) => {
      acc[item.type] = parseInt(item.getDataValue('count'));
      return acc;
    }, {}),
    overdue: overdueCount,
    topAssignees: assigneeStats.map(item => ({
      _id: item.assignee,
      count: parseInt(item.getDataValue('count'))
    })),
    total
  };
};

module.exports = Task;