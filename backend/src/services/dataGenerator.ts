import OpenAI from 'openai'
import type { FormField } from '../types/form'

export class DataGenerator {
  private openai: OpenAI

  private indianFirstNames = [
    'Aarav', 'Advait', 'Arjun', 'Vihaan', 'Reyansh',
    'Aanya', 'Diya', 'Saanvi', 'Myra', 'Ananya',
    'Rohan', 'Kabir', 'Aditya', 'Vivaan', 'Dhruv',
    'Ishaan', 'Shaurya', 'Atharv', 'Pranav', 'Arnav'
  ]

  private indianLastNames = [
    'Patel', 'Sharma', 'Kumar', 'Singh', 'Verma',
    'Gupta', 'Shah', 'Mehta', 'Desai', 'Joshi',
    'Malhotra', 'Kapoor', 'Reddy', 'Nair', 'Rao',
    'Chauhan', 'Chopra', 'Mehra', 'Iyer', 'Menon'
  ]

  private indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane'
  ]

  private queries = [
    'I would like to inquire about your services and pricing.',
    'Please provide more information about your products.',
    'I am interested in collaborating with your company.',
    'Could you share details about your business solutions?',
    'I need assistance with your product offerings.',
    'Looking for more information about your company.',
    'Requesting a detailed quote for your services.',
    'Interested in learning more about your expertise.',
    'Would like to discuss a potential business opportunity.',
    'Seeking information about your consulting services.'
  ]

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateData(fields: FormField[]): Promise<Record<string, string>> {
    const generatedData: Record<string, string> = {}

    for (const field of fields) {
      generatedData[field.name] = await this.generateFieldValue(field)
    }

    return generatedData
  }

  private async generateFieldValue(field: FormField): Promise<string> {
    // Handle select fields directly
    if (field.type === 'select' && field.options?.length) {
      return field.options[Math.floor(Math.random() * field.options.length)]
    }

    // Generate contextual data based on field type and label
    const prompt = this.createPrompt(field)
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates realistic test data for form fields. Respond only with the value, no explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    })

    return completion.choices[0].message.content?.trim() || this.getFallbackValue(field)
  }

  private createPrompt(field: FormField): string {
    const context = field.label || field.name || field.placeholder || ''
    const type = field.type || 'text'

    switch (type) {
      case 'email':
        return `Generate a valid email address that would be appropriate for a field labeled "${context}" in India`
      
      case 'tel':
        return `Generate a valid phone number that would be appropriate for a field labeled "${context}" in India`
      
      case 'number':
        const validation = field.validation || {}
        const min = validation.min !== undefined ? `minimum ${validation.min}, ` : ''
        const max = validation.max !== undefined ? `maximum ${validation.max}, ` : ''
        return `Generate a number (${min}${max}context: "${context}")`
      
      case 'date':
        return `Generate a valid date in YYYY-MM-DD format that would be appropriate for a field labeled "${context}" in India`
      
      case 'password':
        return 'Generate a strong password with mixed case, numbers, and special characters'
      
      case 'url':
        return `Generate a valid URL that would be appropriate for a field labeled "${context}" in India`
      
      case 'textarea':
        return `Generate a short paragraph of text that would be appropriate for a field labeled "${context}" in India`
      
      case 'checkbox':
      case 'radio':
        return Math.random() > 0.5 ? 'true' : 'false'
      
      default:
        return `Generate appropriate text for a field labeled "${context}" in India`
    }
  }

  private getFallbackValue(field: FormField): string {
    switch (field.type) {
      case 'email':
        return 'test@example.com'
      case 'tel':
        return '+1234567890'
      case 'number':
        return '42'
      case 'date':
        return new Date().toISOString().split('T')[0]
      case 'password':
        return 'Test123!@#'
      case 'url':
        return 'https://example.com'
      case 'textarea':
        return 'Sample text for testing purposes.'
      case 'checkbox':
      case 'radio':
        return 'false'
      default:
        return 'Test value'
    }
  }

  generateName(): string {
    const firstName = this.indianFirstNames[Math.floor(Math.random() * this.indianFirstNames.length)]
    const lastName = this.indianLastNames[Math.floor(Math.random() * this.indianLastNames.length)]
    return `${firstName} ${lastName}`
  }

  generateEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.')
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    return `${cleanName}@${domain}`
  }

  generatePhoneNumber(): string {
    // Indian mobile numbers start with 6-9 and have 10 digits
    const prefixes = ['6', '7', '8', '9']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const number = Math.floor(Math.random() * 900000000) + 100000000
    return `+91${prefix}${number}`
  }

  generateQuery(): string {
    return this.queries[Math.floor(Math.random() * this.queries.length)]
  }

  generateFormData(fields: any[]): Record<string, any> {
    const formData: Record<string, any> = {}
    const name = this.generateName()

    fields.forEach(field => {
      const fieldName = field.name.toLowerCase()
      const fieldType = field.type.toLowerCase()

      if (fieldType === 'file' || fieldName.includes('captcha')) {
        // Skip file and captcha fields as they need special handling
        return
      }

      if (fieldName.includes('name')) {
        formData[field.name] = name
      } else if (fieldName.includes('email')) {
        formData[field.name] = this.generateEmail(name)
      } else if (fieldName.includes('phone') || fieldName.includes('mobile')) {
        formData[field.name] = this.generatePhoneNumber()
      } else if (fieldName.includes('message') || fieldName.includes('query') || fieldType === 'textarea') {
        formData[field.name] = this.generateQuery()
      } else {
        // For any other text field, use name as default
        formData[field.name] = name
      }
    })

    return formData
  }
}
