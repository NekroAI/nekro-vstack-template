/**
 * API 类型定义
 * 从 generated.ts 重新导出类型，提供统一的类型访问入口
 */

// 重新导出所有生成的类型
export type * from './generated'

/**
 * 用户信息类型
 * 注意：如果 generated.ts 中已有 User 类型，优先使用生成的类型
 */
export interface User {
  /** 用户ID */
  id: string | number
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  /** 昵称 */
  nickname?: string
  /** 角色 */
  role?: string
  /** 是否激活 */
  is_active?: boolean
  /** 创建时间 */
  created_at?: string
  /** 更新时间 */
  updated_at?: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string
  password: string
  email?: string
  nickname?: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** 访问令牌 */
  access_token: string
  /** 令牌类型 */
  token_type: string
  /** 用户信息 */
  user: User
}

/**
 * Token 响应
 */
export interface TokenResponse {
  access_token: string
  token_type: string
}
