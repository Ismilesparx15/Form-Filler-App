import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { formApi } from '../services/formApi'

export const FormAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await formApi.analyzeForm(url)
      navigate('/')
    } catch (error) {
      console.error('Error analyzing form:', error)
      setError('Failed to analyze form. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Analyze New Form
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Form URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/form"
              error={!!error}
              helperText={error}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !url}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Form'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
