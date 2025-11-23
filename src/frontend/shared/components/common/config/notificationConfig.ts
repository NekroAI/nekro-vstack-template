/**
 * 通知系统配置
 * 统一管理通知的默认配置
 */

export const notificationConfig = {
  /** 默认自动隐藏时间(毫秒) */
  autoHideDuration: 3000,
  
  /** 最大同时显示数量 */
  maxSnack: 3,
  
  /** 通知位置 */
  anchorOrigin: {
    vertical: 'top' as const,
    horizontal: 'right' as const,
  },
  
  /** 防止重复通知 */
  preventDuplicate: true,
}

