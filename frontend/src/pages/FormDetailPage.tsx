import { useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material'
import { useFormStore } from '../store/formStore'
import { LoadingError } from '../components/LoadingError'

export function FormDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentForm, loading, error, loadForm, loadSubmissions, submissions } = useFormStore()

  useEffect(() => {
    if (id) {
      loadForm(id)
      loadSubmissions(id)
    }
  }, [id, loadForm, loadSubmissions])

  if (!currentForm) {
    return <LoadingError loading={loading} error={error} />
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {currentForm.name}
        </Typography>
        <Button
          component={RouterLink}
          to={`/forms/${id}/fill`}
          variant="contained"
          startIcon={<PlayArrowIcon />}
        >
          Fill Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Form Details
              </Typography>
              <Box mb={2}>
                <Typography color="textSecondary" gutterBottom>
                  URL
                </Typography>
                <Link href={currentForm.url} target="_blank" rel="noopener noreferrer">
                  {currentForm.url}
                </Link>
              </Box>
              {currentForm.description && (
                <Box mb={2}>
                  <Typography color="textSecondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography>{currentForm.description}</Typography>
                </Box>
              )}
              <Box mb={2}>
                <Typography color="textSecondary" gutterBottom>
                  Submit Button
                </Typography>
                <Typography>
                  Selector: <code>{currentForm.submitButton.selector}</code>
                  {currentForm.submitButton.text && ` (Text: "${currentForm.submitButton.text}")`}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Form Fields ({currentForm.fields.length})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Validation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentForm.fields.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell>
                          <Typography variant="body2">
                            {field.label || field.name}
                            {field.placeholder && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                Placeholder: {field.placeholder}
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={field.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <Chip
                              label="Required"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="Optional"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {field.validation && Object.entries(field.validation).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Submissions
              </Typography>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <Paper
                    key={submission._id}
                    sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {new Date(submission.timestamp).toLocaleString()}
                    </Typography>
                    <Chip
                      label={submission.status}
                      color={submission.status === 'success' ? 'success' : 'error'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    {submission.error && (
                      <Typography color="error" variant="body2">
                        {submission.error}
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography color="textSecondary">
                  No submissions yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
