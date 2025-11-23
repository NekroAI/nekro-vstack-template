/**
 * HTTP 客户端配置
 * 基于 axios 创建统一的 HTTP 客户端实例
 */
import axios from 'axios'
import { config } from '../../../config/env'
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseErrorInterceptor,
} from './interceptors'

/**
 * HTTP 客户端实例
 */
export const httpClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 注册请求拦截器
httpClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

// 注册响应拦截器
httpClient.interceptors.response.use(response => response, responseErrorInterceptor)

// 默认导出
export default httpClient
