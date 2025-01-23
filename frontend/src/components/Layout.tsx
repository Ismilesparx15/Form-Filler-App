import { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  Link,
} from '@mui/material'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            Form Filler
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/forms">
            Forms
          </Button>
          <Button color="inherit" component={RouterLink} to="/analyze">
            Analyze Form
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Form Filler. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
