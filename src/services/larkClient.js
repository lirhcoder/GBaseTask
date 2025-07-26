const lark = require('@larksuiteoapi/node-sdk');

class LarkTableClient {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.client = null;
  }

  async initialize() {
    this.client = new lark.Client({
      appId: this.appId,
      appSecret: this.appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  }

  async getTableRecords(appToken, tableId, viewId = null) {
    try {
      const params = {
        app_token: appToken,
        table_id: tableId,
        page_size: 500
      };
      
      if (viewId) {
        params.view_id = viewId;
      }

      const response = await this.client.bitable.appTableRecord.list({
        path: params,
      });

      if (response.code !== 0) {
        throw new Error(`获取记录失败: ${response.msg}`);
      }

      return response.data;
    } catch (error) {
      console.error('获取表格记录失败:', error);
      throw error;
    }
  }

  async updateRecord(appToken, tableId, recordId, fields) {
    try {
      const response = await this.client.bitable.appTableRecord.update({
        path: {
          app_token: appToken,
          table_id: tableId,
          record_id: recordId,
        },
        data: {
          fields: fields
        }
      });

      if (response.code !== 0) {
        throw new Error(`更新记录失败: ${response.msg}`);
      }

      return response.data;
    } catch (error) {
      console.error('更新记录失败:', error);
      throw error;
    }
  }

  async createRecord(appToken, tableId, fields) {
    try {
      const response = await this.client.bitable.appTableRecord.create({
        path: {
          app_token: appToken,
          table_id: tableId,
        },
        data: {
          fields: fields
        }
      });

      if (response.code !== 0) {
        throw new Error(`创建记录失败: ${response.msg}`);
      }

      return response.data;
    } catch (error) {
      console.error('创建记录失败:', error);
      throw error;
    }
  }

  async getTableInfo(appToken, tableId) {
    try {
      const response = await this.client.bitable.appTable.get({
        path: {
          app_token: appToken,
          table_id: tableId,
        }
      });

      if (response.code !== 0) {
        throw new Error(`获取表格信息失败: ${response.msg}`);
      }

      return response.data;
    } catch (error) {
      console.error('获取表格信息失败:', error);
      throw error;
    }
  }

  async getAppInfo(appToken) {
    try {
      const response = await this.client.bitable.app.get({
        path: {
          app_token: appToken,
        }
      });

      if (response.code !== 0) {
        throw new Error(`获取应用信息失败: ${response.msg}`);
      }

      return response.data;
    } catch (error) {
      console.error('获取应用信息失败:', error);
      throw error;
    }
  }
}

module.exports = LarkTableClient;