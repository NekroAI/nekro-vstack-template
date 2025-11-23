/**
 * 通知系统Hook
 * 提供便捷的通知方法
 */
import { useCallback, useMemo } from 'react'
import { useSnackbar, VariantType, OptionsObject } from 'notistack'
import { notificationConfig } from '../components/common/config/notificationConfig'

interface NotificationOptions extends Partial<OptionsObject> {
  duration?: number
}

/**
 * 通知系统Hook
 * 提供统一的通知方法
 */
export function useNotification() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const notify = useCallback(
    (message: string, variant: VariantType = 'default', options?: NotificationOptions) => {
      return enqueueSnackbar(message, {
        variant,
        autoHideDuration: options?.duration || notificationConfig.autoHideDuration,
        ...options,
      })
    },
    [enqueueSnackbar]
  )

  const success = useCallback(
    (message: string, options?: NotificationOptions) => notify(message, 'success', options),
    [notify]
  )

  const error = useCallback(
    (message: string, options?: NotificationOptions) =>
      notify(message, 'error', { autoHideDuration: 5000, ...options }),
    [notify]
  )

  const warning = useCallback(
    (message: string, options?: NotificationOptions) => notify(message, 'warning', options),
    [notify]
  )

  const info = useCallback(
    (message: string, options?: NotificationOptions) => notify(message, 'info', options),
    [notify]
  )

  const close = useCallback((key: string | number) => {
    closeSnackbar(key)
  }, [closeSnackbar])

  const closeAll = useCallback(() => {
    closeSnackbar()
  }, [closeSnackbar])

  return useMemo(
    () => ({ notify, success, error, warning, info, close, closeAll }),
    [notify, success, error, warning, info, close, closeAll]
  )
}