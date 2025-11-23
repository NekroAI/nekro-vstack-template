/**
 * 用户功能 API
 */
import { httpClient } from '@/frontend/core/http'
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/frontend/core/types'

/**
 * 用户认证 API
 */
export const userAPI = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/register', data)
    return response.data
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/auth/me')
    return response.data
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  /**
   * 刷新令牌
   */
  async refreshToken(): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/refresh')
    return response.data
  },
}

