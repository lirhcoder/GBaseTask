const cron = require('node-cron');

class SyncService {
  constructor(taskSystem) {
    this.taskSystem = taskSystem;
    this.syncJob = null;
    this.syncHistory = [];
    this.maxHistorySize = 100;
  }

  start(cronExpression = '0 */30 * * * *') {
    console.log(`启动同步服务，同步计划: ${cronExpression}`);
    
    this.syncJob = cron.schedule(cronExpression, async () => {
      await this.performSync();
    });

    this.performSync();
  }

  stop() {
    if (this.syncJob) {
      this.syncJob.stop();
      console.log('同步服务已停止');
    }
  }

  async performSync() {
    console.log('=== 开始同步任务 ===');
    const startTime = Date.now();
    
    try {
      const result = await this.taskSystem.syncAllToTasks();
      const duration = Date.now() - startTime;
      
      const syncRecord = {
        timestamp: new Date(),
        duration,
        success: true,
        result
      };
      
      this.addToHistory(syncRecord);
      
      console.log(`=== 同步完成 ===`);
      console.log(`总计同步: ${result.total.synced} 条记录`);
      console.log(`错误: ${result.total.errors} 条`);
      console.log(`耗时: ${duration}ms`);
      
      return syncRecord;
    } catch (error) {
      console.error('同步失败:', error);
      
      const syncRecord = {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      };
      
      this.addToHistory(syncRecord);
      
      throw error;
    }
  }

  async syncBugsOnly() {
    console.log('手动同步 Bug 数据...');
    try {
      const result = await this.taskSystem.syncBugsToTasks();
      console.log('Bug 同步完成:', result);
      return result;
    } catch (error) {
      console.error('Bug 同步失败:', error);
      throw error;
    }
  }

  async syncRequirementsOnly() {
    console.log('手动同步需求数据...');
    try {
      const result = await this.taskSystem.syncRequirementsToTasks();
      console.log('需求同步完成:', result);
      return result;
    } catch (error) {
      console.error('需求同步失败:', error);
      throw error;
    }
  }

  getSyncHistory(limit = 10) {
    return this.syncHistory.slice(-limit);
  }

  getLastSyncInfo() {
    return this.syncHistory[this.syncHistory.length - 1] || null;
  }

  getSyncStatus() {
    const lastSync = this.getLastSyncInfo();
    const isRunning = this.syncJob && this.syncJob.getStatus() === 'scheduled';
    
    return {
      isRunning,
      lastSync,
      totalSyncs: this.syncHistory.length,
      successfulSyncs: this.syncHistory.filter(h => h.success).length,
      failedSyncs: this.syncHistory.filter(h => !h.success).length,
      averageDuration: this.calculateAverageDuration()
    };
  }

  addToHistory(record) {
    this.syncHistory.push(record);
    
    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory.shift();
    }
  }

  calculateAverageDuration() {
    if (this.syncHistory.length === 0) return 0;
    
    const totalDuration = this.syncHistory.reduce((sum, record) => sum + record.duration, 0);
    return Math.round(totalDuration / this.syncHistory.length);
  }

  updateCronExpression(newExpression) {
    this.stop();
    this.start(newExpression);
    console.log(`同步计划已更新为: ${newExpression}`);
  }
}

module.exports = SyncService;