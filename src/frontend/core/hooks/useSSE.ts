import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useUserStore } from '@/frontend/shared/stores/user'
import { env } from '@/config/env'

export interface LogEntry {
  id: string
  time: string
  level: string
  message: string
  module: string
  line: number
}

interface UseSSEOptions {
  onMessage?: (data: LogEntry) => void
  onError?: (error: unknown) => void
  maxRetries?: number
}

export function useLogStream(url: string, options: UseSSEOptions = {}) {
  const { token } = useUserStore()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const ctrlRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  // 保持 options 引用最新，避免闭包陷阱
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const connect = useCallback(() => {
    if (!token) return

    // 取消之前的连接
    if (ctrlRef.current) {
      ctrlRef.current.abort()
    }

    const ctrl = new AbortController()
    ctrlRef.current = ctrl

    const fullUrl = url.startsWith('http') ? url : `${env.API_BASE_URL}${url}`

    fetchEventSource(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      signal: ctrl.signal,
      openWhenHidden: true, // 允许切后台时保持连接

      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          console.log('SSE Connected')
          setIsConnected(true)
          setError(null)
          retryCountRef.current = 0 // 重置重试计数
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          // 客户端错误（如 401, 403, 404），不再重试
          const body = await response.text().catch(() => 'Unknown error')
          console.error('SSE Client Error:', body)
          // 抛出 FatalError 会停止 fetchEventSource 重试
          throw new Error(`Fatal connection error: ${response.status} ${body}`)
        } else {
          // 其他错误（如 500），抛出普通错误以触发重试
          const body = await response.text().catch(() => 'Unknown error')
          throw new Error(`Failed to connect: ${response.status} ${body}`)
        }
      },

      onmessage(msg) {
        // 处理心跳或自定义事件
        if (msg.event === 'log') {
          try {
            const data = JSON.parse(msg.data)
            optionsRef.current.onMessage?.(data)
          } catch (e) {
            console.error('Failed to parse SSE message', e)
          }
        }
      },

      onclose() {
        // 连接关闭（例如服务器关闭连接），这里不抛出错误，让它自然结束或重连
        // 如果需要自动重连，可以抛出错误
        console.log('SSE Connection closed by server')
      },

      onerror(err) {
        console.error('SSE error:', err)
        // 如果是致命错误（我们在 onopen 中抛出的），不再重试
        if (err instanceof Error && err.message.startsWith('Fatal')) {
          throw err
        }

        setError(err instanceof Error ? err : new Error(String(err)))
        setIsConnected(false)

        // 检查重试次数
        if (
          optionsRef.current.maxRetries &&
          retryCountRef.current >= optionsRef.current.maxRetries
        ) {
          throw err // 停止重试
        }

        retryCountRef.current += 1
        // fetchEventSource 会自动处理重试间隔 (exponential backoff)
      },
    }).catch(err => {
      if (!ctrl.signal.aborted) {
        console.error('SSE Connection failed entirely:', err)
        setIsConnected(false)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }, [url, token])

  const disconnect = useCallback(() => {
    if (ctrlRef.current) {
      ctrlRef.current.abort()
      ctrlRef.current = null
    }
    setIsConnected(false)
  }, [])

  // 自动连接
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  }
}
