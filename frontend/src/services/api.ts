import axios from 'axios'
import type { Form, FormSubmission } from '../../../backend/src/types/form'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const formApi = {
  // Analyze a form from a URL
  analyzeForm: async (url: string) => {
    const response = await api.post<Form>('/forms/analyze', { url })
    return response.data
  },

  // Get all forms
  getForms: async () => {
    const response = await api.get<Form[]>('/forms')
    return response.data
  },

  // Get a single form
  getForm: async (id: string) => {
    const response = await api.get<Form>(`/forms/${id}`)
    return response.data
  },

  // Submit a form
  submitForm: async (
    formId: string,
    values: Record<string, any>,
    options?: { visible?: boolean; fillDelay?: number }
  ) => {
    const response = await api.post<FormSubmission>(`/forms/${formId}/submit`, {
      formId,
      values,
      options,
    })
    return response.data
  },

  // Get form submissions
  getFormSubmissions: async (formId: string) => {
    const response = await api.get<FormSubmission[]>(`/forms/${formId}/submissions`)
    return response.data
  },
}
