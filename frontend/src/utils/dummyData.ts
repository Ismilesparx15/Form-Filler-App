import type { FormField } from '../../../backend/src/types/form'

export function generateDummyValue(field: FormField): string | number | boolean {
  const { type, validation } = field

  switch (type) {
    case 'text':
      return 'Sample Text'
    case 'email':
      return 'test@example.com'
    case 'password':
      return 'Password123!'
    case 'tel':
      return '+1234567890'
    case 'url':
      return 'https://example.com'
    case 'number':
      const min = validation?.min ?? 0
      const max = validation?.max ?? 100
      return Math.floor(Math.random() * (max - min + 1)) + min
    case 'checkbox':
      return true
    case 'radio':
      return field.options?.[0] || ''
    case 'select':
      return field.options?.[0] || ''
    case 'date':
      return new Date().toISOString().split('T')[0]
    case 'datetime-local':
      return new Date().toISOString().slice(0, 16)
    case 'time':
      return '12:00'
    case 'week':
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
      return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`
    case 'month':
      return `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
    case 'color':
      return '#ff0000'
    case 'range':
      const rangeMin = validation?.min ?? 0
      const rangeMax = validation?.max ?? 100
      return Math.floor((rangeMax + rangeMin) / 2)
    case 'search':
      return 'search query'
    case 'textarea':
      return 'This is a sample text area content with multiple lines.\nIt can contain line breaks and longer content.'
    default:
      return ''
  }
}

export function generateDummyFormData(fields: FormField[]): Record<string, any> {
  const formData: Record<string, any> = {}
  
  fields.forEach(field => {
    if (field.name) {
      formData[field.name] = generateDummyValue(field)
    }
  })
  
  return formData
}
