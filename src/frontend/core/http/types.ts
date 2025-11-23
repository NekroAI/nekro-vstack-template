/**
 * HTTP 相关类型定义
 */

/**
 * API 错误响应格式
 */
export interface APIErrorResponse {
  success: false
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * API 成功响应格式
 */
export interface APISuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/**
 * API 响应格式（联合类型）
 */
export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse
