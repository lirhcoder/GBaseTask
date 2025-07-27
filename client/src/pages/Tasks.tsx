import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../config/api';
import { Task, TaskStatus } from '../types';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    search: '',
  });

  // 获取任务列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', page, rowsPerPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      return api.get(`${endpoints.tasks.list}?${params}`);
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: TaskStatus) => {
    const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'default',
      in_progress: 'primary',
      completed: 'success',
      closed: 'success',
      cancelled: 'default',
      testing: 'info',
      reopened: 'warning',
    };
    return colorMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success',
    };
    return colorMap[priority] || 'info';
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      bug: '🐛',
      requirement: '📋',
      task: '📌',
      other: '📄',
    };
    return iconMap[type] || '📄';
  };

  const getStatusText = (status: TaskStatus) => {
    const textMap: Record<TaskStatus, string> = {
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
      deferred: '延期',
    };
    return textMap[status] || status;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">任务管理</Typography>
        <Box>
          <Tooltip title="刷新">
            <IconButton onClick={() => refetch()} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          >
            创建任务
          </Button>
        </Box>
      </Box>

      {/* 筛选栏 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>状态</InputLabel>
              <Select
                value={filters.status}
                label="状态"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="pending">待处理</MenuItem>
                <MenuItem value="in_progress">进行中</MenuItem>
                <MenuItem value="completed">已完成</MenuItem>
                <MenuItem value="closed">已关闭</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>优先级</InputLabel>
              <Select
                value={filters.priority}
                label="优先级"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="urgent">紧急</MenuItem>
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>类型</InputLabel>
              <Select
                value={filters.type}
                label="类型"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="requirement">需求</MenuItem>
                <MenuItem value="task">任务</MenuItem>
                <MenuItem value="other">其他</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="搜索"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="标题、描述..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 任务列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>标题</TableCell>
              <TableCell align="center">类型</TableCell>
              <TableCell align="center">状态</TableCell>
              <TableCell align="center">优先级</TableCell>
              <TableCell>负责人</TableCell>
              <TableCell>截止日期</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.tasks?.map((task: Task) => (
              <TableRow key={task.id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${getTypeIcon(task.type)} ${task.type}`}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusText(task.status)}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{task.assignee || '-'}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('zh-CN')
                    : '-'}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="查看">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="编辑">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data?.tasks?.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">暂无任务</Typography>
          </Box>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default Tasks;