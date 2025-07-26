const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database-sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'display_name'
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'developer', 'viewer'),
    defaultValue: 'developer'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  department: {
    type: DataTypes.STRING
  },
  larkUserId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'lark_user_id'
  },
  avatar: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  refreshToken: {
    type: DataTypes.STRING,
    field: 'refresh_token'
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        lark: true,
        browser: true
      }
    }
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['lark_user_id'] },
    { fields: ['role'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// 实例方法
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateAuthToken = function() {
  const payload = {
    id: this.id,
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

User.prototype.generateRefreshToken = function() {
  const payload = {
    id: this.id,
    tokenType: 'refresh'
  };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '30d' }
  );
  
  return refreshToken;
};

User.prototype.hasPermission = function(resource, action) {
  if (this.role === 'admin') return true;
  
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action);
};

User.prototype.getDefaultPermissions = function() {
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

User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

User.prototype.toSafeObject = function() {
  const user = this.toJSON();
  delete user.password;
  delete user.refreshToken;
  return user;
};

module.exports = User;