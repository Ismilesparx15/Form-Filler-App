import mongoose from 'mongoose'
import type { Form } from '../types/form'

const formFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'text', 'number', 'email', 'password', 'checkbox', 'radio', 'select', 'textarea',
      'tel', 'url', 'date', 'datetime-local', 'time', 'week', 'month', 'color',
      'file', 'hidden', 'image', 'range', 'reset', 'search', 'submit'
    ]
  },
  label: String,
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
  validation: {
    required: Boolean,
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
  },
  value: String,
  selector: String,
})

const formSchema = new mongoose.Schema<Form>({
  url: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  fields: [formFieldSchema],
  submitButton: {
    selector: String,
    text: String,
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
})

// Update the 'updated' field on save
formSchema.pre('save', function(next) {
  this.updated = new Date()
  next()
})

export const FormModel = mongoose.model<Form>('Form', formSchema)
