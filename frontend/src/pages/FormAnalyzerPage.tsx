import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material'
import { useFormStore } from '../store/formStore'
import { LoadingError } from '../components/LoadingError'

export function FormAnalyzerPage() {
  const navigate = useNavigate()
  const { analyzeForm, loading, error } = useFormStore()
  const [url, setUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await analyzeForm(url)
      navigate('/forms')
    } catch (error) {
      console.error('Failed to analyze form:', error)
    }
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" component="h1" gutterBottom>
        Analyze Web Form
      </Typography>
      
      <Card>
        <CardContent>
          <LoadingError loading={loading} error={error}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Form URL"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/form"
                required
                type="url"
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !url}
                fullWidth
              >
                Analyze Form
              </Button>
            </form>
          </LoadingError>
        </CardContent>
      </Card>
    </Box>
  )
}
