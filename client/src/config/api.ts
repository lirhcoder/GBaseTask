import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除 token 并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 端点
export const endpoints = {
  // 认证
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  
  // 任务
  tasks: {
    list: '/tasks',
    detail: (id: string) => `/tasks/${id}`,
    create: '/tasks',
    update: (id: string) => `/tasks/${id}`,
    updateStatus: (id: string) => `/tasks/${id}/status`,
    delete: (id: string) => `/tasks/${id}`,
    statistics: '/tasks/statistics',
    overdue: '/tasks/overdue',
  },
  
  // 同步
  sync: {
    manual: '/sync/manual',
    bugs: '/sync/bugs',
    requirements: '/sync/requirements',
    status: '/sync/status',
    history: '/sync/history',
    schedule: '/sync/schedule',
    stop: '/sync/stop',
    start: '/sync/start',
  },
  
  // 用户
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    permissions: (id: string) => `/users/${id}/permissions`,
    statistics: '/users/statistics/overview',
  },
};