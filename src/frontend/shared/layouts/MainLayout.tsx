import { Suspense, useState } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Palette as PaletteIcon,
  ReceiptLong as LogsIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

import { env } from '@/config/env'
import { useUserStore } from '@/frontend/shared/stores/user'
import { useThemeStore, type ColorPalette } from '@/frontend/shared/stores/theme'
import { pageVariants } from '@/frontend/core/animation'
import { systemColors } from '@/frontend/core/theme/macOS'

const drawerWidth = 260

const menuItems = [
  { path: '/dashboard', text: '仪表盘', icon: <DashboardIcon /> },
  { path: '/monitor/logs', text: '实时日志', icon: <LogsIcon /> },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  // Stores
  const { user, logout } = useUserStore()
  const { mode, toggleMode, setPalette, palette } = useThemeStore()

  // Menu state
  const [anchorElPalette, setAnchorElPalette] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Area */}
      <Toolbar sx={{ px: 3, mb: 1 }}>
        <Box component="img" src="/vite.svg" sx={{ height: 32, width: 32, mr: 1.5 }} />
        <Typography variant="h6" fontWeight={700} noWrap>
          {env.APP_NAME}
        </Typography>
      </Toolbar>

      {/* Navigation Items */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map(item => {
          const isSelected = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) handleDrawerToggle()
                }}
                sx={{
                  borderRadius: '8px',
                  minHeight: 44,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user?.username?.slice(0, 2).toUpperCase() || 'USER'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap fontWeight={600}>
              {user?.nickname || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight={600}>
              {menuItems.find(i => i.path === location.pathname)?.text || '控制台'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={`切换至${mode === 'light' ? '深色' : '浅色'}模式`}>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Palette Selector */}
            <Tooltip title="主题色">
              <IconButton onClick={e => setAnchorElPalette(e.currentTarget)} color="inherit">
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElPalette}
              open={Boolean(anchorElPalette)}
              onClose={() => setAnchorElPalette(null)}
              PaperProps={{
                sx: { mt: 1.5, minWidth: 180 },
              }}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                选择强调色
              </Typography>
              {(
                Object.keys(systemColors).filter(k =>
                  ['blue', 'purple', 'green', 'orange'].includes(k)
                ) as ColorPalette[]
              ).map(p => (
                <MenuItem
                  key={p}
                  onClick={() => {
                    setPalette(p)
                    setAnchorElPalette(null)
                  }}
                  selected={palette === p}
                  sx={{ gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: systemColors[p as keyof typeof systemColors].light,
                    }}
                  />
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {p}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Box
            component={motion.div}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'auto',
              p: { xs: 2, sm: 4 },
            }}
          >
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </Box>
        </Suspense>
      </Box>
    </Box>
  )
}
