import { Request, Response } from 'express'
import { FormModel } from '../models/Form'
import { FormSubmissionModel } from '../models/FormSubmission'
import { FormAnalyzer } from '../services/FormAnalyzer'
import { FormSubmitter } from '../services/FormSubmitter'
import { FormSchema, FormSubmissionSchema } from '../types/form'

const formAnalyzer = new FormAnalyzer()
const formSubmitter = new FormSubmitter()

export const formController = {
  // Analyze a form from a URL
  async analyzeForm(req: Request, res: Response) {
    try {
      const { url } = req.body

      if (!url) {
        return res.status(400).json({ error: 'URL is required' })
      }

      const analyzedForm = await formAnalyzer.analyzeForm(url)
      const validatedForm = FormSchema.parse({
        ...analyzedForm,
        created: new Date(),
        updated: new Date(),
      })

      const form = new FormModel(validatedForm)
      await form.save()

      res.json(form)
    } catch (error) {
      console.error('Error analyzing form:', error)
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to analyze form' 
      })
    }
  },

  // Get all forms
  async getForms(req: Request, res: Response) {
    try {
      const forms = await FormModel.find().sort({ updated: -1 })
      res.json(forms)
    } catch (error) {
      console.error('Error getting forms:', error)
      res.status(500).json({ error: 'Failed to get forms' })
    }
  },

  // Get a single form by ID
  async getForm(req: Request, res: Response) {
    try {
      const form = await FormModel.findById(req.params.id)
      if (!form) {
        return res.status(404).json({ error: 'Form not found' })
      }
      res.json(form)
    } catch (error) {
      console.error('Error getting form:', error)
      res.status(500).json({ error: 'Failed to get form' })
    }
  },

  // Delete a form by ID
  async deleteForm(req: Request, res: Response) {
    try {
      const form = await FormModel.findByIdAndDelete(req.params.id)
      if (!form) {
        return res.status(404).json({ error: 'Form not found' })
      }
      res.json({ message: 'Form deleted successfully' })
    } catch (error) {
      console.error('Error deleting form:', error)
      res.status(500).json({ error: 'Failed to delete form' })
    }
  },

  // Clear all forms
  async clearForms(req: Request, res: Response) {
    try {
      await FormModel.deleteMany({})
      res.json({ message: 'All forms cleared successfully' })
    } catch (error) {
      console.error('Error clearing forms:', error)
      res.status(500).json({ error: 'Failed to clear forms' })
    }
  },

  // Submit a form
  async submitForm(req: Request, res: Response) {
    try {
      // Get form data and options from request
      const { formData, options } = req.body
      const formId = req.params.id

      // Find the form
      const form = await FormModel.findById(formId)
      if (!form) {
        return res.status(404).json({ error: 'Form not found' })
      }

      let submissionResult;
      let submissionError;

      try {
        // Submit the form using FormSubmitter
        submissionResult = await formSubmitter.submitForm(form.toObject(), formData, {
          speed: options?.speed || 500,
          visible: options?.visible !== false
        })
      } catch (error) {
        console.error('Error during form submission:', error)
        submissionError = error instanceof Error ? error.message : 'Form submission failed'
      } finally {
        // Always close the browser
        await formSubmitter.close()
      }

      // Create a submission record
      const submission = new FormSubmissionModel({
        formId: form._id,
        values: formData,
        status: submissionError ? 'error' : 'success',
        error: submissionError,
        timestamp: new Date()
      })

      await submission.save()

      // Update form's last updated timestamp
      form.updated = new Date()
      await form.save()

      if (submissionError) {
        return res.status(500).json({ 
          error: submissionError,
          submission: submission.toObject()
        })
      }

      res.json({ 
        message: 'Form submitted successfully',
        submission: submission.toObject()
      })
    } catch (error) {
      console.error('Error in form submission process:', error)
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process form submission' 
      })
    }
  },

  // Get form submissions
  async getFormSubmissions(req: Request, res: Response) {
    try {
      const submissions = await FormSubmissionModel.find({ formId: req.params.id })
        .sort({ timestamp: -1 })
      res.json(submissions)
    } catch (error) {
      console.error('Error getting form submissions:', error)
      res.status(500).json({ error: 'Failed to get form submissions' })
    }
  }
}
