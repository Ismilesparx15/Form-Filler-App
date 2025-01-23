import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useFormStore } from '../store/formStore'
import { LoadingError } from '../components/LoadingError'
import { generateDummyFormData } from '../utils/dummyData'

export function FormFillPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentForm, loading, error, loadForm, submitForm } = useFormStore()
  const [visibleFill, setVisibleFill] = useState(true)
  const [fillDelay, setFillDelay] = useState(500)

  useEffect(() => {
    if (id) {
      loadForm(id)
    }
  }, [id, loadForm])

  // Dynamically create validation schema based on form fields
  const validationSchema = z.object(
    currentForm?.fields.reduce((acc, field) => {
      let schema = z.string()

      if (field.type === 'number') {
        schema = z.preprocess((val) => {
          if (typeof val === 'string') {
            const parsed = parseFloat(val)
            return isNaN(parsed) ? undefined : parsed
          }
          return val
        }, z.number())

        if (field.validation?.min !== undefined && !isNaN(field.validation.min)) {
          schema = schema.min(field.validation.min, `Value must be at least ${field.validation.min}`)
        }
        if (field.validation?.max !== undefined && !isNaN(field.validation.max)) {
          schema = schema.max(field.validation.max, `Value must be at most ${field.validation.max}`)
        }
      } else if (field.type === 'email') {
        schema = z.string().email('Invalid email address')
      } else if (field.type === 'tel') {
        schema = z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number format')
      } else if (field.type === 'url') {
        schema = z.string().url('Invalid URL format')
      } else {
        if (field.validation?.minLength !== undefined && field.validation.minLength > 0) {
          schema = schema.min(field.validation.minLength, `Must be at least ${field.validation.minLength} characters`)
        }
        if (field.validation?.maxLength !== undefined && field.validation.maxLength > 0) {
          schema = schema.max(field.validation.maxLength, `Must be at most ${field.validation.maxLength} characters`)
        }
        if (field.validation?.pattern) {
          schema = schema.regex(new RegExp(field.validation.pattern), 'Invalid format')
        }
      }

      if (field.required) {
        schema = schema.min(1, 'This field is required')
      } else {
        schema = schema.optional()
      }

      return { ...acc, [field.name]: schema }
    }, {}) || {}
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
  })

  const onSubmit = async (data: any) => {
    if (currentForm) {
      await submitForm(currentForm._id!, data, { visible: visibleFill, fillDelay })
    }
  }

  const fillDummyData = () => {
    if (!currentForm) return
    const dummyData = generateDummyFormData(currentForm.fields)
    reset(dummyData)
  }

  if (!currentForm) {
    return <LoadingError loading={loading} error={error} />
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {currentForm?.name || 'Form Fill'}
      </Typography>

      {loading && <CircularProgress />}
      {error && <LoadingError message={error} />}

      {currentForm && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={visibleFill}
                            onChange={(e) => setVisibleFill(e.target.checked)}
                          />
                        }
                        label="Show form filling process"
                      />
                    </Grid>
                    {visibleFill && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel id="fill-speed-label">Fill Speed</InputLabel>
                          <Select
                            labelId="fill-speed-label"
                            value={fillDelay}
                            label="Fill Speed"
                            onChange={(e) => setFillDelay(Number(e.target.value))}
                          >
                            <MenuItem value={200}>Fast (200ms)</MenuItem>
                            <MenuItem value={500}>Normal (500ms)</MenuItem>
                            <MenuItem value={1000}>Slow (1000ms)</MenuItem>
                          </Select>
                          <FormHelperText>
                            Delay between filling each field
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Box mb={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={fillDummyData}
                  disabled={loading}
                >
                  Fill with Dummy Data
                </Button>
              </Box>
            </Grid>
            {currentForm.fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                <Controller
                  name={field.name}
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => {
                    switch (field.type) {
                      case 'checkbox':
                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => onChange(e.target.checked)}
                              />
                            }
                            label={field.label || field.name}
                          />
                        )

                      case 'radio':
                        return (
                          <FormControl error={!!errors[field.name]}>
                            <Typography color="textSecondary" gutterBottom>
                              {field.label || field.name}
                            </Typography>
                            <RadioGroup value={value} onChange={onChange}>
                              {field.options?.map((option) => (
                                <FormControlLabel
                                  key={option}
                                  value={option}
                                  control={<Radio />}
                                  label={option}
                                />
                              ))}
                            </RadioGroup>
                            {errors[field.name] && (
                              <FormHelperText>
                                {errors[field.name]?.message as string}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )

                      case 'select':
                        return (
                          <FormControl
                            fullWidth
                            error={!!errors[field.name]}
                          >
                            <InputLabel>{field.label || field.name}</InputLabel>
                            <Select value={value} onChange={onChange} label={field.label || field.name}>
                              {field.options?.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors[field.name] && (
                              <FormHelperText>
                                {errors[field.name]?.message as string}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )

                      case 'textarea':
                        return (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={field.label || field.name}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={onChange}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message as string}
                          />
                        )

                      default:
                        return (
                          <TextField
                            fullWidth
                            type={field.type}
                            label={field.label || field.name}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={onChange}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message as string}
                          />
                        )
                    }
                  }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/forms/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Submit Form
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
    </Box>
  )
}
