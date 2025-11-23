/**
 * 环境配置
 */

// 环境类型
export type Environment = 'development' | 'production' | 'test'

// 环境配置接口
export interface Config {
  env: Environment
  apiBaseUrl: string
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
}

// 获取当前环境
const getEnvironment = (): Environment => {
  if (import.meta.env.MODE === 'production') return 'production'
  if (import.meta.env.MODE === 'test') return 'test'
  return 'development'
}

// 根据环境获取API基础URL
const getApiBaseUrl = (): string => {
  const env = getEnvironment()

  // 生产环境
  if (env === 'production') {
    return import.meta.env.VITE_API_BASE_URL || '/api'
  }

  // 开发环境
  if (env === 'development') {
    return import.meta.env.VITE_API_BASE_URL || '/api'
  }

  // 测试环境
  return '/api'
}

// 导出配置
export const config: Config = {
  env: getEnvironment(),
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: getEnvironment() === 'development',
  isProduction: getEnvironment() === 'production',
  isTest: getEnvironment() === 'test',
}

// 导出环境变量
export const env = {
  // API相关
  API_BASE_URL: config.apiBaseUrl,

  // 应用相关
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Nekro VStack',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '0.1.0',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || '垂直切分的 AI 友好全栈开发模板',

  // 功能开关
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || config.isDevelopment,
}

// 开发环境日志
if (config.isDevelopment) {
  console.log('🔧 Environment Config:', {
    environment: config.env,
    apiBaseUrl: config.apiBaseUrl,
    appName: env.APP_NAME,
    enableMock: env.ENABLE_MOCK,
    enableDebug: env.ENABLE_DEBUG,
  })
}
