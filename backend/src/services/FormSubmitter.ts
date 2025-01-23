import { chromium, type Browser, type Page } from 'playwright'
import type { Form, FormField } from '../types/form'

export class FormSubmitter {
  private browser: Browser | null = null
  private page: Page | null = null

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false // Always show browser for visibility
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

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async submitForm(form: Form, formData: Record<string, any>, options: { speed?: number; visible?: boolean } = {}) {
    const speed = options.speed || 500 // Default speed 500ms

    try {
      await this.init()

      // Create a new context and page
      const context = await this.browser!.newContext({
        viewport: { width: 1280, height: 720 }
      })
      this.page = await context.newPage()

      // Navigate to the form URL
      console.log('Navigating to form URL:', form.url)
      await this.page.goto(form.url)
      await this.page.waitForLoadState('networkidle')
      await this.sleep(speed) // Wait for page to settle

      // Fill each field
      for (const field of form.fields) {
        // Skip file and captcha fields
        if (field.type === 'file' || field.name.toLowerCase().includes('captcha')) {
          console.log('Skipping field:', field.name)
          continue
        }

        const value = formData[field.name]
        if (value === undefined || value === null) {
          console.log('No value for field:', field.name)
          continue
        }

        console.log('Filling field:', field.name, 'with value:', value)

        try {
          // Try different selectors to find the field
          let element = null
          const selectors = [
            field.selector,
            `[name="${field.name}"]`,
            `[id="${field.name}"]`,
            field.xpath,
            `input[name="${field.name}"]`,
            `textarea[name="${field.name}"]`,
            `select[name="${field.name}"]`,
            `[placeholder*="${field.name}"]`,
            `[aria-label*="${field.name}"]`
          ]

          for (const selector of selectors) {
            if (!selector) continue
            element = await this.page.$(selector)
            if (element) {
              console.log('Found field with selector:', selector)
              break
            }
          }

          if (!element) {
            console.warn('Field not found:', field.name)
            continue
          }

          // Scroll element into view
          await element.scrollIntoViewIfNeeded()
          await this.sleep(speed / 2)

          // Highlight the field
          await element.evaluate((el) => {
            el.style.border = '2px solid blue'
            el.style.boxShadow = '0 0 5px rgba(0, 0, 255, 0.5)'
          })

          // Clear the field
          await element.click({ clickCount: 3 })
          await element.press('Backspace')
          await this.sleep(speed / 2)

          // Type the value character by character
          await element.type(value.toString(), { delay: speed / 10 })

          // Remove highlight
          await element.evaluate((el) => {
            el.style.border = ''
            el.style.boxShadow = ''
          })

          await this.sleep(speed / 2)
        } catch (error) {
          console.error('Error filling field:', field.name, error)
        }
      }

      // Find and click the submit button
      console.log('Looking for submit button...')
      const submitButton = await this.findSubmitButton()
      
      if (submitButton) {
        // Highlight the submit button
        await submitButton.evaluate((el) => {
          el.style.border = '2px solid green'
          el.style.boxShadow = '0 0 5px rgba(0, 255, 0, 0.5)'
        })
        
        await this.sleep(speed)
        console.log('Clicking submit button')
        await submitButton.click()
        
        // Wait for navigation or network idle
        await Promise.race([
          this.page.waitForNavigation(),
          this.page.waitForLoadState('networkidle')
        ])

        // Show success message
        await this.page.evaluate(() => {
          const dialog = document.createElement('div')
          dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
            animation: fadeIn 0.3s ease-out;
          `
          dialog.innerHTML = `
            <div style="margin-bottom: 15px;"> Form Submitted Successfully!</div>
            <div style="font-size: 14px;">This window will close in 3 seconds...</div>
          `
          document.body.appendChild(dialog)

          // Add fade-in animation
          const style = document.createElement('style')
          style.textContent = `
            @keyframes fadeIn {
              from { opacity: 0; transform: translate(-50%, -60%); }
              to { opacity: 1; transform: translate(-50%, -50%); }
            }
          `
          document.head.appendChild(style)
        })

        // Wait 3 seconds before closing
        await this.sleep(3000)
      } else {
        console.warn('Submit button not found')
      }

      // Return success
      return { success: true }
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  }

  private async findSubmitButton(): Promise<Page | null> {
    if (!this.page) return null

    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Send")',
      '[role="button"]:has-text("Submit")',
      '[role="button"]:has-text("Send")',
      'button.submit',
      '.submit button',
      'button.submit-button',
      'button#submit'
    ]

    for (const selector of selectors) {
      const button = await this.page.$(selector)
      if (button) {
        console.log('Found submit button with selector:', selector)
        return button
      }
    }

    return null
  }
}
