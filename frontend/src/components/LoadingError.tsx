import { Alert, AlertTitle, Box, CircularProgress } from '@mui/material'

interface LoadingErrorProps {
  loading?: boolean
  error?: string | null
  children?: React.ReactNode
}

export function LoadingError({ loading, error, children }: LoadingErrorProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    )
  }

  return <>{children}</>
}
