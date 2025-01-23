import { z } from 'zod'

// Form field validation schema
export const FormFieldValidationSchema = z.object({
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
}).optional()

// Form field schema
export const FormFieldSchema = z.object({
  name: z.string(),
  type: z.enum([
    'text', 'number', 'email', 'password', 'checkbox', 'radio', 'select', 'textarea',
    'tel', 'url', 'date', 'datetime-local', 'time', 'week', 'month', 'color',
    'file', 'hidden', 'image', 'range', 'reset', 'search', 'submit'
  ]),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: FormFieldValidationSchema,
  value: z.string().optional(),
  selector: z.string().optional(),
  xpath: z.string(), // Added this field
})

// Submit button schema
export const SubmitButtonSchema = z.object({
  selector: z.string(),
  text: z.string().optional(),
  xpath: z.string(), // Added this field
}).optional()

// Form schema
export const FormSchema = z.object({
  _id: z.string().optional(),
  url: z.string().url(),
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  submitButton: SubmitButtonSchema,
  created: z.date(),
  updated: z.date(),
  submitButtonXPath: z.string(), // Added this field
})

// Form submission schema
export const FormSubmissionSchema = z.object({
  _id: z.string().optional(),
  formId: z.string(),
  values: z.record(z.any()),
  status: z.enum(['success', 'error']),
  error: z.string().optional(),
  timestamp: z.date(),
})

// Type definitions
export type FormFieldValidation = z.infer<typeof FormFieldValidationSchema>
export type FormField = z.infer<typeof FormFieldSchema>
export type SubmitButton = z.infer<typeof SubmitButtonSchema>
export type Form = z.infer<typeof FormSchema>
export type FormSubmission = z.infer<typeof FormSubmissionSchema>
