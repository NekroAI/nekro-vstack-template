import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  Grid2,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  Switch,
  FormControlLabel,
  type SxProps,
  type Theme,
} from '@mui/material'
import {
  Memory as CpuIcon,
  Storage as DiskIcon,
  Speed as RamIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Extension as ExtensionIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Dns as OsIcon,
  Tag as VersionIcon,
  Cloud as EnvIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

import { useUserStore } from '@/frontend/shared/stores/user'
import { dashboardAPI, type AppOverview, type SystemInfo } from '@/features/dashboard/frontend'
import { containerVariants, itemVariants, scaleVariants } from '@/frontend/core/animation'
import { systemColors } from '@/frontend/core/theme/macOS'

// --- Components ---

interface GlassCardProps {
  children: ReactNode
  sx?: SxProps<Theme>
  [key: string]: unknown
}

const GlassCard = ({ children, sx, ...props }: GlassCardProps) => {
  const theme = useTheme()
  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  )
}

interface SystemCardProps {
  title: string
  subtitle: string
  percent: number
  used: string // For CPU this is frequency
  total: string // For CPU this is cores
  usedLabel?: string
  totalLabel?: string
  icon: React.ElementType
  color: string
  loading: boolean
}

const SystemCard = ({
  title,
  subtitle,
  percent,
  used,
  total,
  usedLabel = '已用',
  totalLabel = '总量',
  icon: Icon,
  color,
  loading,
}: SystemCardProps) => {
  // 根据百分比动态调整颜色 (CPU/Memory/Disk 超过 90% 变红)
  const statusColor = percent > 90 ? systemColors.red.light : color

  return (
    <GlassCard>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              component={motion.div}
              variants={scaleVariants}
              whileTap="tap"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(statusColor, 0.1),
                color: statusColor,
              }}
            >
              <Icon />
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                {title}
              </Typography>
              <Typography variant="body1" fontWeight={600} noWrap sx={{ maxWidth: 140 }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: statusColor }}>
              {percent}
              <Typography component="span" variant="h6" sx={{ opacity: 0.6 }}>
                %
              </Typography>
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5 }} />
        ) : (
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: alpha(statusColor, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: statusColor,
                borderRadius: 5,
              },
            }}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {usedLabel}:{' '}
            <Box component="span" sx={{ color: 'text.primary' }}>
              {used}
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {totalLabel}:{' '}
            <Box component="span" sx={{ color: 'text.primary' }}>
              {total}
            </Box>
          </Typography>
        </Box>
      </CardContent>
    </GlassCard>
  )
}

interface StatCardProps {
  title: string
  value: string | number | ReactNode
  icon: React.ElementType
  color: string
  loading: boolean
}

const StatCard = ({ title, value, icon: Icon, color, loading }: StatCardProps) => (
  <GlassCard>
    <CardContent
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: '10px',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ mt: 1, pl: 0.5 }}>
        {loading ? (
          <Skeleton width={80} height={40} />
        ) : (
          <Typography variant="h4" fontWeight={700} component="div">
            {value}
          </Typography>
        )}
      </Box>
    </CardContent>
  </GlassCard>
)

const InfoRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  icon: React.ElementType
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
    </Box>
    <Box>
      {typeof value === 'string' ? (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
)

// --- Helpers ---

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  return `${hours}h ${minutes}m`
}

// --- Main Page ---

export default function Dashboard() {
  const { user } = useUserStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [overview, setOverview] = useState<AppOverview | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const theme = useTheme()

  const fetchData = useCallback(async () => {
    // 仅在没有数据时显示加载状态，避免闪烁
    setOverview(prev => {
      if (!prev) setLoading(true)
      return prev
    })

    try {
      const [overviewData, systemData] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getSystemInfo(),
      ])
      setOverview(overviewData)
      setSystemInfo(systemData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    void fetchData()

    if (!autoRefresh) return

    const timer = setInterval(() => {
      void fetchData()
    }, 3000)
    return () => clearInterval(timer)
  }, [fetchData, autoRefresh])

  const getGreeting = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour < 5) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }, [currentTime])

  return (
    <Stack
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      spacing={4}
      sx={{ pb: 4 }}
    >
      {/* Header */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {currentTime.toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            {getGreeting}，{user?.nickname || user?.username}
          </Typography>
        </Box>

        {/* Auto Refresh Switch */}
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              自动刷新
            </Typography>
          }
          sx={{
            mr: 0,
            pl: 1,
            pr: 2,
            py: 0.5,
            borderRadius: '24px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: alpha(theme.palette.background.paper, 0.8),
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 24px ${alpha(theme.palette.common.black, 0.08)}`,
            },
          }}
        />
      </Box>

      {/* System Status (Top Row) */}
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <SystemCard
            title="CPU"
            subtitle={systemInfo?.cpu.name || 'Processor'}
            percent={systemInfo?.cpu.usage || 0}
            used={systemInfo?.cpu.used || '-'}
            total={systemInfo?.cpu.total || '-'}
            usedLabel="频率"
            totalLabel="核心"
            icon={CpuIcon}
            color={theme.palette.primary.main}
            loading={loading && !systemInfo}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <SystemCard
            title="Memory"
            subtitle={systemInfo?.memory.name || 'RAM'}
            percent={systemInfo?.memory.usage || 0}
            used={systemInfo?.memory.used || '-'}
            total={systemInfo?.memory.total || '-'}
            icon={RamIcon}
            color={theme.palette.success.main}
            loading={loading && !systemInfo}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <SystemCard
            title="Disk"
            subtitle={systemInfo?.disk.name || 'Storage'}
            percent={systemInfo?.disk.usage || 0}
            used={systemInfo?.disk.used || '-'}
            total={systemInfo?.disk.total || '-'}
            icon={DiskIcon}
            color={theme.palette.warning.main}
            loading={loading && !systemInfo}
          />
        </Grid2>
      </Grid2>

      {/* Content Grid (Middle Row) */}
      <Grid2 container spacing={3}>
        {/* Overview Cards */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="API 接口"
                value={overview?.api_count || 0}
                icon={CodeIcon}
                color={systemColors.indigo.light}
                loading={loading && !overview}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Feature 模块"
                value={overview?.feature_count || 0}
                icon={ExtensionIcon}
                color={systemColors.green.light}
                loading={loading && !overview}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="数据库状态"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {overview?.db_status === 'Connected' ? (
                      <CheckCircleIcon color="success" fontSize="medium" />
                    ) : (
                      <ErrorIcon color="error" fontSize="medium" />
                    )}
                    <Typography variant="h5" fontWeight={700}>
                      {overview?.db_status === 'Connected' ? '已连接' : '断开'}
                    </Typography>
                  </Box>
                }
                icon={StorageIcon}
                color={systemColors.blue.light}
                loading={loading && !overview}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="运行时间"
                value={formatUptime(systemInfo?.uptime_seconds || 0)}
                icon={ScheduleIcon}
                color={systemColors.orange.light}
                loading={loading && !systemInfo}
              />
            </Grid2>
          </Grid2>
        </Grid2>

        {/* Info Column (Right) */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <GlassCard sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                环境信息
              </Typography>
              <Stack
                spacing={1}
                divider={<Box sx={{ borderBottom: `1px dashed ${theme.palette.divider}` }} />}
              >
                <InfoRow
                  label="Environment"
                  value={
                    <Chip
                      label={overview?.environment || 'Development'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 24 }}
                    />
                  }
                  icon={EnvIcon}
                />
                <InfoRow label="OS" value={systemInfo?.os || '-'} icon={OsIcon} />
                <InfoRow
                  label="Version"
                  value={systemInfo?.version || 'v1.0.0'}
                  icon={VersionIcon}
                />
              </Stack>
            </GlassCard>

            {/* 技术栈区域 - 修复 flex 和显示问题 */}
            <Box sx={{ flex: 1 }}>
              <GlassCard sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                  技术栈
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    'React 18',
                    'TypeScript',
                    'MUI v6',
                    'Framer Motion',
                    'Zustand',
                    'FastAPI',
                    'Tortoise',
                  ].map(tech => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        borderRadius: '6px',
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </GlassCard>
            </Box>
          </Stack>
        </Grid2>
      </Grid2>
    </Stack>
  )
}
