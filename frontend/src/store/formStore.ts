import { create } from 'zustand'
import type { Form, FormSubmission } from '../../../backend/src/types/form'
import { formApi } from '../services/api'

interface FormStore {
  forms: Form[]
  currentForm: Form | null
  submissions: FormSubmission[]
  loading: boolean
  error: string | null
  
  // Actions
  loadForms: () => Promise<void>
  loadForm: (id: string) => Promise<void>
  analyzeForm: (url: string) => Promise<void>
  submitForm: (
    formId: string,
    values: Record<string, any>,
    options?: { visible?: boolean; fillDelay?: number }
  ) => Promise<void>
  loadSubmissions: (formId: string) => Promise<void>
  clearError: () => void
}

export const useFormStore = create<FormStore>((set, get) => ({
  forms: [],
  currentForm: null,
  submissions: [],
  loading: false,
  error: null,

  loadForms: async () => {
    try {
      set({ loading: true, error: null })
      const forms = await formApi.getForms()
      set({ forms, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load forms',
        loading: false 
      })
    }
  },

  loadForm: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const form = await formApi.getForm(id)
      set({ currentForm: form, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load form',
        loading: false 
      })
    }
  },

  analyzeForm: async (url: string) => {
    try {
      set({ loading: true, error: null })
      const form = await formApi.analyzeForm(url)
      set(state => ({ 
        forms: [form, ...state.forms],
        currentForm: form,
        loading: false 
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to analyze form',
        loading: false 
      })
    }
  },

  submitForm: async (formId: string, values: Record<string, any>, options = {}) => {
    try {
      set({ loading: true, error: null })
      const submission = await formApi.submitForm(formId, values, options)
      set((state) => ({
        submissions: [...state.submissions, submission],
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit form',
        loading: false 
      })
    }
  },

  loadSubmissions: async (formId: string) => {
    try {
      set({ loading: true, error: null })
      const submissions = await formApi.getFormSubmissions(formId)
      set({ submissions, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load submissions',
        loading: false 
      })
    }
  },

  clearError: () => set({ error: null }),
}))
