import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { formApi } from '../services/formApi'
import { useNavigate } from 'react-router-dom'
import type { Form } from '../types/form'

export const FormList: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadForms = async () => {
    try {
      setLoading(true)
      setError(null)
      const forms = await formApi.getForms()
      setForms(forms)
    } catch (error) {
      console.error('Error loading forms:', error)
      setError('Failed to load forms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await formApi.deleteForm(id)
      await loadForms()
    } catch (error) {
      console.error('Error deleting form:', error)
      setError('Failed to delete form. Please try again.')
    }
  }

  const handleClearAll = async () => {
    try {
      await formApi.clearForms()
      await loadForms()
    } catch (error) {
      console.error('Error clearing forms:', error)
      setError('Failed to clear forms. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading forms...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadForms} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Analyzed Forms</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/analyze')}
            sx={{ mr: 2 }}
          >
            Analyze New Form
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearAll}
          >
            Clear All Forms
          </Button>
        </Box>
      </Box>

      {forms.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="textSecondary">
              No forms analyzed yet. Click "Analyze New Form" to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {forms.map((form) => (
            <ListItem
              key={form._id}
              component={Card}
              sx={{ mb: 2 }}
            >
              <ListItemText
                primary={form.name || 'Untitled Form'}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textSecondary">
                      URL: {form.url}<br />
                      Created: {formatDate(form.created)}<br />
                      Last Updated: {formatDate(form.updated)}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/forms/${form._id}/fill`)}
                  sx={{ mr: 1 }}
                >
                  Fill Form
                </Button>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(form._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
