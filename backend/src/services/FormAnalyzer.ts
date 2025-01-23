import { chromium, type Browser, type Page } from '@playwright/test'
import type { Form, FormField } from '../types/form'

export class FormAnalyzer {
  private browser: Browser | null = null
  private page: Page | null = null

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true
      })
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }

  async analyzeForm(url: string): Promise<Omit<Form, '_id' | 'created' | 'updated'>> {
    try {
      await this.init()
      const context = await this.browser!.newContext()
      this.page = await context.newPage()

      // Navigate to the page and wait for it to load
      console.log('Navigating to URL:', url)
      await this.page.goto(url)
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(2000) // Wait for any dynamic content

      // Check for forms using multiple strategies
      const formInfo = await this.page.evaluate(() => {
        // Helper function to get all input fields from an element
        const getInputs = (element: Element) => {
          return Array.from(element.querySelectorAll('input, textarea, select'))
            .filter(input => {
              const type = (input as HTMLInputElement).type?.toLowerCase()
              return !['hidden', 'submit', 'button', 'reset'].includes(type)
            })
        }

        // Strategy 1: Look for <form> elements
        const forms = Array.from(document.querySelectorAll('form'))
        if (forms.length > 0) {
          const mainForm = forms.find(form => getInputs(form).length > 0) || forms[0]
          return { 
            element: 'form',
            inputs: getInputs(mainForm).length,
            hasSubmitButton: mainForm.querySelector('button[type="submit"], input[type="submit"]') !== null
          }
        }

        // Strategy 2: Look for common form container classes
        const formContainers = Array.from(document.querySelectorAll('.form, .contact-form, .contact, .form-container, [class*="form"], [id*="form"]'))
        for (const container of formContainers) {
          const inputs = getInputs(container)
          if (inputs.length > 0) {
            return {
              element: 'container',
              inputs: inputs.length,
              hasSubmitButton: container.querySelector('button, input[type="submit"], [class*="submit"], [id*="submit"]') !== null
            }
          }
        }

        // Strategy 3: Look for groups of input fields
        const allInputs = getInputs(document.body)
        if (allInputs.length > 0) {
          // Find the most likely form container (parent with most input fields)
          const inputParents = allInputs.map(input => input.parentElement)
          const commonParent = inputParents.reduce((a, b) => {
            while (a && b && a !== b) {
              a = a.parentElement
              b = b.parentElement
            }
            return a
          })

          if (commonParent) {
            return {
              element: 'input-group',
              inputs: allInputs.length,
              hasSubmitButton: commonParent.querySelector('button, input[type="submit"], [class*="submit"], [id*="submit"]') !== null
            }
          }
        }

        return null
      })

      if (!formInfo) {
        throw new Error('No form found on the page')
      }

      console.log('Found form:', formInfo)

      // Detect form fields and other elements
      const fields = await this.detectFormFields()
      const { xpath: submitButtonXPath, selector: submitButtonSelector } = await this.detectSubmitButton()
      const name = await this.detectFormName()

      return {
        url,
        name: name || 'Contact Form',
        fields,
        submitButtonXPath,
        submitButton: {
          selector: submitButtonSelector || 'button[type="submit"]',
          xpath: submitButtonXPath
        }
      }
    } catch (error) {
      console.error('Error analyzing form:', error)
      throw error
    } finally {
      await this.close()
    }
  }

  private async detectFormFields(): Promise<FormField[]> {
    if (!this.page) throw new Error('Page not initialized')

    return await this.page.evaluate(() => {
      const fields: FormField[] = []

      // Function to get XPath
      const getXPath = (element: Element): string => {
        const idx = (sib: Element, name: string): number => 
          sib ? idx(sib.previousElementSibling!, name) + (sib.nodeName === name ? 1 : 0) : 0
        const segs = (elm: Element | null): string[] =>
          !elm || elm.tagName === 'BODY' ? [] : [...segs(elm.parentElement), 
            `${elm.tagName.toLowerCase()}${elm.id ? `[@id='${elm.id}']` : 
            `[${1 + idx(elm.previousElementSibling!, elm.tagName)}]`}`]
        return '/' + segs(element).join('/')
      }

      // Function to get field label
      const getFieldLabel = (element: Element): string => {
        // Check for aria-label
        const ariaLabel = element.getAttribute('aria-label')
        if (ariaLabel) return ariaLabel.trim()

        // Check for aria-labelledby
        const labelledBy = element.getAttribute('aria-labelledby')
        if (labelledBy) {
          const labelElement = document.getElementById(labelledBy)
          if (labelElement?.textContent) return labelElement.textContent.trim()
        }

        // Try to find label by for attribute
        if (element.id) {
          const labelEl = document.querySelector(`label[for="${element.id}"]`)
          if (labelEl?.textContent) return labelEl.textContent.trim()
        }

        // Try to find label in parent elements
        let parent = element.parentElement
        while (parent && !parent.matches('form')) {
          const labelEl = parent.querySelector('label')
          if (labelEl?.textContent) return labelEl.textContent.trim()
          parent = parent.parentElement
        }

        // Try to find label in placeholder or name
        const el = element as HTMLInputElement
        return el.placeholder || el.name || el.id || 'Untitled Field'
      }

      // Find all input elements
      const inputSelectors = [
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])',
        'textarea',
        'select'
      ]

      const formElements = document.querySelectorAll('form')
      const containers = document.querySelectorAll('.form, .contact-form, .contact, .form-container, [class*="form"], [id*="form"]')
      
      let searchElements = formElements.length > 0 ? formElements : containers

      if (searchElements.length === 0) {
        searchElements = [document.body] // Fallback to body if no form containers found
      }

      searchElements.forEach(container => {
        inputSelectors.forEach(selector => {
          container.querySelectorAll(selector).forEach(input => {
            const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            
            // Skip hidden or non-visible elements
            if (el.type === 'hidden' || el.offsetParent === null) return
            
            const name = el.name || el.id || getFieldLabel(el).toLowerCase().replace(/[^a-z0-9]/g, '_')
            const label = getFieldLabel(el)
            const xpath = getXPath(el)
            const selector = el.id ? `#${el.id}` : `[name="${name}"]`

            let type = el.type || 'text'
            if (el instanceof HTMLTextAreaElement) type = 'textarea'
            if (el instanceof HTMLSelectElement) type = 'select'

            // Determine field type based on various attributes
            if (name.includes('email') || type === 'email') type = 'email'
            if (name.includes('phone') || name.includes('mobile')) type = 'tel'
            if (name.includes('message') || name.includes('comment')) type = 'textarea'

            fields.push({
              name,
              label,
              type,
              required: el.required,
              xpath,
              selector
            })
          })
        })
      })

      return fields
    })
  }

  private async detectSubmitButton() {
    if (!this.page) throw new Error('Page not initialized')

    return await this.page.evaluate(() => {
      const selectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button',
        '[role="button"]',
        'button.submit',
        '.submit button',
        'button.submit-button',
        'button#submit',
        'button[class*="submit"]',
        'button[id*="submit"]',
        'input[class*="submit"]',
        'input[id*="submit"]'
      ]

      let submitButton: Element | null = null
      let usedSelector = ''

      // First try exact selectors
      for (const selector of selectors) {
        submitButton = document.querySelector(selector)
        if (submitButton) {
          // Verify if this button looks like a submit button
          const text = submitButton.textContent?.toLowerCase() || ''
          const value = (submitButton as HTMLInputElement).value?.toLowerCase() || ''
          const classList = Array.from(submitButton.classList || []).join(' ').toLowerCase()
          const id = submitButton.id?.toLowerCase() || ''
          
          if (
            text.includes('submit') || 
            text.includes('send') || 
            text.includes('request') ||
            value.includes('submit') ||
            value.includes('send') ||
            classList.includes('submit') ||
            id.includes('submit')
          ) {
            usedSelector = selector
            break
          }
        }
      }

      // If no submit button found, try finding by text content
      if (!submitButton) {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]'))
        submitButton = buttons.find(button => {
          const text = button.textContent?.toLowerCase() || ''
          const value = (button as HTMLInputElement).value?.toLowerCase() || ''
          const classList = Array.from(button.classList || []).join(' ').toLowerCase()
          return text.includes('submit') || 
                 text.includes('send') || 
                 text.includes('request') ||
                 value.includes('submit') ||
                 value.includes('send') ||
                 classList.includes('submit')
        }) || null
      }

      if (!submitButton) {
        return { xpath: '', selector: '' }
      }

      // Get XPath
      const getXPath = (element: Element): string => {
        const idx = (sib: Element, name: string): number => 
          sib ? idx(sib.previousElementSibling!, name) + (sib.nodeName === name ? 1 : 0) : 0
        const segs = (elm: Element | null): string[] =>
          !elm || elm.tagName === 'BODY' ? [] : [...segs(elm.parentElement), 
            `${elm.tagName.toLowerCase()}${elm.id ? `[@id='${elm.id}']` : 
            `[${1 + idx(elm.previousElementSibling!, elm.tagName)}]`}`]
        return '/' + segs(element).join('/')
      }

      return {
        xpath: getXPath(submitButton),
        selector: usedSelector || (submitButton.id ? `#${submitButton.id}` : '')
      }
    })
  }

  private async detectFormName(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized')

    return await this.page.evaluate(() => {
      const selectors = [
        'form h1', 'form h2', 'form h3', 'form h4',
        '.form h1', '.form h2', '.form h3', '.form h4',
        '[class*="form"] h1', '[class*="form"] h2', '[class*="form"] h3', '[class*="form"] h4',
        'form .title', '.form .title', '[class*="form"] .title'
      ]

      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          return element.textContent.trim()
        }
      }

      // Try to find any heading near the form
      const form = document.querySelector('form')
      if (form) {
        let parent = form.parentElement
        while (parent && parent !== document.body) {
          const heading = parent.querySelector('h1, h2, h3, h4')
          if (heading?.textContent) {
            return heading.textContent.trim()
          }
          parent = parent.parentElement
        }
      }

      return ''
    })
  }
}
