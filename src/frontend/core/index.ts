/**
 * 前端核心基础设施统一导出
 */

// HTTP 客户端
export { httpClient, httpClient as default } from './http'
export type { APIErrorResponse, APISuccessResponse, APIResponse } from './http'

// 类型定义
export type * from './types'

// 路由
export { default as router } from './router'

