/**
 * 仪表盘功能 API
 */
import { httpClient } from '@/frontend/core/http'

export interface AppOverview {
  api_count: number
  feature_count: number
  db_status: string
  environment: string
}

export interface SystemResource {
  name: string
  usage: number
  total: string
  used: string
}

export interface SystemInfo {
  cpu: SystemResource
  memory: SystemResource
  disk: SystemResource
  uptime: string
  uptime_seconds: number
  version: string
  os: string
}

/**
 * 仪表盘 API
 */
export const dashboardAPI = {
  /**
   * 获取应用概览数据
   */
  async getOverview() {
    const response = await httpClient.get<AppOverview>('/dashboard/overview')
    return response.data
  },

  /**
   * 获取系统信息
   */
  async getSystemInfo() {
    const response = await httpClient.get<SystemInfo>('/dashboard/system')
    return response.data
  },
}
