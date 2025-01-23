import mongoose from 'mongoose'
import type { FormSubmission } from '../types/form'

const formSubmissionSchema = new mongoose.Schema<FormSubmission>({
  formId: { 
    type: String,
    required: true,
    ref: 'Form'
  },
  values: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: { 
    type: String,
    enum: ['success', 'error'],
    required: true 
  },
  error: String,
  timestamp: { 
    type: Date,
    default: Date.now 
  }
})

// Create index for faster queries
formSubmissionSchema.index({ formId: 1, timestamp: -1 })

export const FormSubmissionModel = mongoose.model<FormSubmission>('FormSubmission', formSubmissionSchema)
