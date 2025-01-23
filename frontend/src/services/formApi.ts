import axios from 'axios';
import type { Form } from '../types/form';

const API_BASE_URL = 'http://localhost:3001/api'

export const formApi = {
  // Form Analysis
  async analyzeForm(url: string): Promise<Form> {
    const response = await axios.post(`${API_BASE_URL}/forms/analyze`, { url })
    return response.data
  },

  // Form Management
  async getForms(): Promise<Form[]> {
    const response = await axios.get(`${API_BASE_URL}/forms`)
    return response.data
  },

  async getForm(id: string): Promise<Form> {
    const response = await axios.get(`${API_BASE_URL}/forms/${id}`)
    return response.data
  },

  async deleteForm(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/forms/${id}`)
  },

  async clearForms(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/forms`)
  },

  // Form Submission
  async submitForm(
    formId: string, 
    formData: Record<string, any>,
    options: { speed?: number; visible?: boolean } = {}
  ): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/forms/${formId}/submit`, {
      formData,
      options: {
        speed: options.speed || 500,
        visible: options.visible !== false
      }
    });
    return response.data;
  },

  async getFormSubmissions(formId: string) {
    return axios.get(`${API_BASE_URL}/forms/${formId}/submissions`)
  },
}
