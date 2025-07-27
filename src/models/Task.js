const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['bug', 'requirement', 'task', 'other']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'pending_review', 'in_progress', 'testing', 'resolved', 'completed', 'deployed', 'closed', 'reopened', 'cancelled', 'on_hold', 'cannot_reproduce', 'deferred']
  },
  priority: { 
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  assignee: { type: String, default: '' },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  tags: [{ type: String }],
  sourceId: { type: String },
  sourceType: { 
    type: String,
    enum: ['lark_bug', 'lark_requirement', 'manual', 'other']
  },
  metadata: {
    reporter: String,
    proposer: String,
    module: String,
    severity: String,
    requirementType: String,
    estimatedHours: Number,
    actualHours: Number,
    originalStatus: String,
    originalPriority: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  syncedAt: { type: Date }
}, {
  timestamps: true
});

taskSchema.index({ status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ sourceId: 1, sourceType: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ dueDate: 1 });

taskSchema.methods.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate && !['completed', 'closed', 'cancelled'].includes(this.status);
};

taskSchema.methods.getDaysUntilDue = function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

taskSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (['completed', 'closed', 'resolved'].includes(newStatus)) {
    this.completedAt = new Date();
  } else if (['reopened', 'in_progress'].includes(newStatus)) {
    this.completedAt = null;
  }
};

taskSchema.statics.getStatistics = async function() {
  const [
    statusStats,
    priorityStats,
    typeStats,
    overdueCount,
    assigneeStats
  ] = await Promise.all([
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'closed', 'cancelled'] }
    }),
    this.aggregate([
      { $match: { assignee: { $ne: '' } } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    byStatus: statusStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byType: typeStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    overdue: overdueCount,
    topAssignees: assigneeStats,
    total: await this.countDocuments()
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;