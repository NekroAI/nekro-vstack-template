/**
 * 通用类型定义
 */

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 可选的ID类型
 */
export type ID = string | number

/**
 * 时间戳类型（秒或毫秒）
 */
export type Timestamp = number

/**
 * 排序方向
 */
export type SortOrder = 'asc' | 'desc'

/**
 * 排序参数
 */
export interface SortParams {
  field: string
  order: SortOrder
}

/**
 * 查询参数基类
 */
export interface BaseQueryParams {
  search?: string
  sort?: SortParams
  pagination?: PaginationParams
}

/**
 * 可为空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型（包括 undefined）
 */
export type Optional<T> = T | undefined

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

