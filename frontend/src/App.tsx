import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { FormList } from './components/FormList'
import { FormAnalyzer } from './components/FormAnalyzer'
import { FormFiller } from './components/FormFiller'

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Form Filler App
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Forms
            </Button>
            <Button color="inherit" component={Link} to="/analyze">
              Analyze New Form
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<FormList />} />
            <Route path="/analyze" element={<FormAnalyzer />} />
            <Route path="/forms/:id/fill" element={<FormFiller />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App
