import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useFormStore } from '../store/formStore'
import { LoadingError } from '../components/LoadingError'

export function FormsListPage() {
  const { forms, loading, error, loadForms } = useFormStore()

  useEffect(() => {
    loadForms()
  }, [loadForms])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Analyzed Forms
        </Typography>
        <Button
          component={RouterLink}
          to="/analyze"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Analyze New Form
        </Button>
      </Box>

      <LoadingError loading={loading} error={error}>
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {form.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom noWrap>
                    {form.url}
                  </Typography>
                  <Typography variant="body2">
                    Fields: {form.fields.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last updated: {new Date(form.updated).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/forms/${form._id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/forms/${form._id}/fill`}
                  >
                    Fill Form
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!loading && !error && forms.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No forms analyzed yet
            </Typography>
            <Button
              component={RouterLink}
              to="/analyze"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Analyze Your First Form
            </Button>
          </Box>
        )}
      </LoadingError>
    </Box>
  )
}
