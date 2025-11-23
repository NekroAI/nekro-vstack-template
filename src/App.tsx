import { useEffect, useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/frontend/core'
import { useUserStore } from '@/frontend/shared/stores/user'
import { useThemeStore } from '@/frontend/shared/stores/theme'
import { getTheme } from '@/frontend/core/theme'

const queryClient = new QueryClient()

function App() {
  const { isAuthLoading, checkAuth } = useUserStore()
  const { mode, palette } = useThemeStore()
  const theme = useMemo(() => getTheme(mode, palette), [mode, palette])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  if (isAuthLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
