import express from 'express'
import { formController } from '../controllers/form.controller'

const router = express.Router()

// Form analysis and management
router.post('/analyze', formController.analyzeForm)
router.get('/', formController.getForms)
router.get('/:id', formController.getForm)
router.delete('/:id', formController.deleteForm)

// Form submission
router.post('/:id/submit', async (req, res) => {
  try {
    const { formData, options } = req.body
    await formController.submitForm(req, res)
  } catch (error) {
    console.error('Error submitting form:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to submit form' 
    })
  }
})

router.get('/:id/submissions', formController.getFormSubmissions)

// Clear all forms
router.delete('/', formController.clearForms)

export default router
