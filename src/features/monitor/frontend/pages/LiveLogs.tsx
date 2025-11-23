import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  DeleteSweep,
  VerticalAlignBottom,
  Search,
  BugReport,
  Info,
  Warning,
  Error as ErrorIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogStream, type LogEntry } from '@/frontend/core/hooks/useSSE'
import { containerVariants } from '@/frontend/core/animation'

// --- Components ---

const LogLevelChip = ({ level }: { level: string }) => {
  let color: 'default' | 'info' | 'warning' | 'error' | 'success' = 'default'
  let icon: React.ReactElement | undefined = undefined

  switch (level.toUpperCase()) {
    case 'INFO':
      color = 'info'
      icon = <Info fontSize="inherit" />
      break
    case 'WARNING':
      color = 'warning'
      icon = <Warning fontSize="inherit" />
      break
    case 'ERROR':
    case 'CRITICAL':
      color = 'error'
      icon = <ErrorIcon fontSize="inherit" />
      break
    case 'DEBUG':
      color = 'success' // 使用绿色
      icon = <BugReport fontSize="inherit" />
      break
  }

  return (
    <Chip
      label={level}
      size="small"
      color={color}
      icon={icon}
      sx={{
        fontWeight: 700,
        minWidth: 80,
        justifyContent: 'flex-start',
        height: 24,
        fontSize: '0.75rem',
      }}
    />
  )
}

interface ExtendedLogEntry extends LogEntry {
  exception?: {
    text?: string
    traceback?: unknown
  }
  extra?: Record<string, unknown>
  process?: string
  thread?: string
}

const LogItem = ({
  log,
  isNew,
  onClick,
}: {
  log: ExtendedLogEntry
  isNew: boolean
  onClick: () => void
}) => {
  const theme = useTheme()

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      onClick={onClick}
      sx={{
        p: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: isNew ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
        '&:hover': {
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.primary.main, 0.08),
        },
        '&:active': {
          transform: 'scale(0.995)',
        },
        display: 'grid',
        gridTemplateColumns: '160px 90px 1fr',
        gap: 2,
        alignItems: 'start',
        fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
        fontSize: '0.85rem',
      }}
    >
      {/* Time */}
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'inherit' }}>
        {log.time}
      </Typography>

      {/* Level */}
      <Box>
        <LogLevelChip level={log.level} />
      </Box>

      {/* Message */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: 'inherit',
            wordBreak: 'break-all',
            color: 'text.primary',
            whiteSpace: 'pre-wrap',
          }}
        >
          {log.message}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 0.5, opacity: 0.7 }}
        >
          {log.module}:{log.line}
        </Typography>
      </Box>
    </Box>
  )
}

// --- Details Dialog ---

const LogDetailsDialog = ({
  log,
  open,
  onClose,
}: {
  log: ExtendedLogEntry | null
  open: boolean
  onClose: () => void
}) => {
  const theme = useTheme()

  if (!log) return null

  const handleCopy = () => {
    const text = JSON.stringify(log, null, 2)
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          backgroundImage: 'none',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            日志详情
          </Typography>
          <LogLevelChip level={log.level} />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Basic Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Time:
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              {log.time}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Module:
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              {log.module}:{log.line}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Process/Thread:
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              {log.process || '-'} / {log.thread || '-'}
            </Typography>
          </Box>

          {/* Message */}
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Message
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.action.hover, 0.1),
                fontFamily: 'Monaco, Menlo, Consolas, monospace',
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {log.message}
            </Paper>
          </Box>

          {/* Exception */}
          {log.exception && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="error.main">
                Exception
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  borderColor: alpha(theme.palette.error.main, 0.2),
                  fontFamily: 'Monaco, Menlo, Consolas, monospace',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  color: theme.palette.error.main,
                }}
              >
                {JSON.stringify(log.exception, null, 2)}
              </Paper>
            </Box>
          )}

          {/* Extra */}
          {log.extra && Object.keys(log.extra).length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Extra Data
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  fontFamily: 'Monaco, Menlo, Consolas, monospace',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {JSON.stringify(log.extra, null, 2)}
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button startIcon={<CopyIcon />} onClick={handleCopy}>
          复制 JSON
        </Button>
        <Button onClick={onClose} variant="contained">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// --- Main Page ---

export default function LiveLogs() {
  const theme = useTheme()
  const [logs, setLogs] = useState<ExtendedLogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ExtendedLogEntry | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastLogRef = useRef<string | null>(null)

  // SSE Hook
  const { isConnected, error } = useLogStream('/monitor/logs/live', {
    onMessage: (log: ExtendedLogEntry) => {
      if (isPaused) return
      setLogs(prev => {
        // 保持最近 500 条
        const newLogs = [...prev, log]
        if (newLogs.length > 500) {
          return newLogs.slice(newLogs.length - 500)
        }
        return newLogs
      })
      lastLogRef.current = log.id
    },
  })

  // Auto scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Handle scroll to detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50
    if (isAtBottom !== autoScroll) {
      setAutoScroll(isAtBottom)
    }
  }

  return (
    <>
      <Stack
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        spacing={2}
        sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}
      >
        {/* Header & Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              实时日志
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  boxShadow: isConnected ? `0 0 8px ${theme.palette.success.main}` : 'none',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {isConnected ? '已连接' : error ? `连接断开: ${error.message}` : '连接中...'}
              </Typography>
              <Chip
                label={`${logs.length} 条记录`}
                size="small"
                variant="outlined"
                sx={{ ml: 1, height: 20 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isPaused ? '继续' : '暂停'}>
              <IconButton
                onClick={() => setIsPaused(!isPaused)}
                color={isPaused ? 'warning' : 'default'}
              >
                {isPaused ? <PlayArrow /> : <Pause />}
              </IconButton>
            </Tooltip>

            <Tooltip title="清空日志">
              <IconButton onClick={() => setLogs([])}>
                <DeleteSweep />
              </IconButton>
            </Tooltip>

            <Tooltip title={`自动滚动: ${autoScroll ? '开启' : '关闭'}`}>
              <IconButton
                onClick={() => setAutoScroll(!autoScroll)}
                color={autoScroll ? 'primary' : 'default'}
              >
                <VerticalAlignBottom />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Log Viewer */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            flex: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            ref={scrollRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme.palette.action.disabled,
              },
            }}
          >
            <AnimatePresence initial={false}>
              {logs.map(log => (
                <LogItem
                  key={log.id}
                  log={log}
                  isNew={log.id === lastLogRef.current}
                  onClick={() => setSelectedLog(log)}
                />
              ))}
            </AnimatePresence>

            {logs.length === 0 && (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Search sx={{ fontSize: 48, opacity: 0.5 }} />
                <Typography>暂无日志数据</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Details Dialog */}
      <LogDetailsDialog
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  )
}
