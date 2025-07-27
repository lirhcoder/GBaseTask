const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'developer', 'viewer'],
    default: 'developer'
  },
  permissions: [{
    resource: {
      type: String,
      enum: ['tasks', 'bugs', 'requirements', 'sync', 'users', 'reports']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'sync', 'export']
    }]
  }],
  department: {
    type: String,
    trim: true
  },
  // Lark OAuth 相关字段
  larkUserId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  larkAccessToken: {
    type: String
  },
  larkRefreshToken: {
    type: String
  },
  larkTokenExpiry: {
    type: Date
  },
  larkUserId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    },
    notifications: {
      email: { type: Boolean, default: true },
      lark: { type: Boolean, default: true },
      browser: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ larkUserId: 1 });
userSchema.index({ role: 1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 生成 JWT Token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    permissions: this.permissions
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  return token;
};

// 生成 Refresh Token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    tokenType: 'refresh'
  };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '30d' }
  );
  
  return refreshToken;
};

// 检查用户权限
userSchema.methods.hasPermission = function(resource, action) {
  // 管理员拥有所有权限
  if (this.role === 'admin') return true;
  
  // 检查特定权限
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action);
};

// 获取用户的默认权限
userSchema.methods.getDefaultPermissions = function() {
  const rolePermissions = {
    admin: [
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'bugs', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'requirements', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'sync', actions: ['create', 'read', 'update', 'delete', 'sync'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] }
    ],
    manager: [
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'bugs', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'requirements', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'sync', actions: ['read', 'sync'] },
      { resource: 'reports', actions: ['read', 'export'] }
    ],
    developer: [
      { resource: 'tasks', actions: ['create', 'read', 'update'] },
      { resource: 'bugs', actions: ['create', 'read', 'update'] },
      { resource: 'requirements', actions: ['read'] },
      { resource: 'sync', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ],
    viewer: [
      { resource: 'tasks', actions: ['read'] },
      { resource: 'bugs', actions: ['read'] },
      { resource: 'requirements', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ]
  };
  
  return rolePermissions[this.role] || [];
};

// 更新最后登录时间
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// 获取安全的用户信息（不包含敏感数据）
userSchema.methods.toSafeObject = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;