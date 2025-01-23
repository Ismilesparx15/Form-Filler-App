import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { Form } from '../types/form';
import { formApi } from '../services/formApi';

const indianNames = [
  'Aarav Sharma', 'Ananya Patel', 'Arjun Gupta', 'Diya Mehta', 
  'Rohan Malhotra', 'Saanvi Reddy', 'Vihaan Singh', 'Zara Kapoor'
];

const generateIndianData = () => {
  const name = indianNames[Math.floor(Math.random() * indianNames.length)];
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com';
  const phone = '+91' + (Math.floor(Math.random() * 9000000000) + 1000000000);
  const queries = [
    'I would like to inquire about your services and pricing details.',
    'Could you please provide more information about your business solutions?',
    'I am interested in learning more about your company and services.',
    'Please share details about your product offerings and availability.',
    'I would like to schedule a consultation to discuss business opportunities.',
    'Requesting information about your professional services and expertise.',
    'Interested in understanding your company\'s approach to client solutions.',
    'Looking to explore potential business collaboration opportunities.'
  ];
  const query = queries[Math.floor(Math.random() * queries.length)];

  return { name, email, phone, query };
};

export const FormFiller: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilling, setShowFilling] = useState(true);
  const [fillSpeed, setFillSpeed] = useState<number>(500);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldAnalysis, setFieldAnalysis] = useState<Record<string, { type: string; format: string }>>({});

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const loadedForm = await formApi.getForm(id);
      setForm(loadedForm);
      analyzeFields(loadedForm.fields);
    } catch (error) {
      console.error('Error loading form:', error);
      setError('Failed to load form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFields = (fields: any[]) => {
    const analysis: Record<string, { type: string; format: string }> = {};
    
    fields.forEach(field => {
      const name = field.name.toLowerCase();
      let type = field.type;
      let format = '';

      if (name.includes('name')) {
        format = 'Indian Name (e.g., Aarav Sharma)';
      } else if (name.includes('email')) {
        format = 'Email Address (e.g., name@domain.com)';
      } else if (name.includes('phone') || name.includes('mobile')) {
        format = 'Indian Phone Number (+91XXXXXXXXXX)';
      } else if (name.includes('message') || name.includes('query')) {
        format = 'Business Query';
      }

      analysis[field.name] = { type, format };
    });

    setFieldAnalysis(analysis);
  };

  const handleFill = () => {
    const indianData = generateIndianData();
    const newFormData: Record<string, string> = {};

    form?.fields.forEach(field => {
      const fieldName = field.name.toLowerCase();
      if (fieldName.includes('name')) {
        newFormData[field.name] = indianData.name;
      } else if (fieldName.includes('email')) {
        newFormData[field.name] = indianData.email;
      } else if (fieldName.includes('phone') || fieldName.includes('mobile')) {
        newFormData[field.name] = indianData.phone;
      } else if (fieldName.includes('message') || fieldName.includes('query')) {
        newFormData[field.name] = indianData.query;
      }
    });

    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    try {
      setAnalyzing(true);
      setError(null);
      
      await formApi.submitForm(form._id, formData, {
        speed: fillSpeed,
        visible: showFilling
      });

      // Navigate back to forms list after successful submission
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInputChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: e.target.value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Form not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Fill Form: {form.name}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Field Analysis:</Typography>
            {Object.entries(fieldAnalysis).map(([fieldName, analysis]) => (
              <Box key={fieldName} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {fieldName}:
                  <Chip 
                    label={analysis.type} 
                    size="small" 
                    sx={{ ml: 1, mr: 1 }} 
                  />
                  <Chip 
                    label={analysis.format} 
                    size="small" 
                    variant="outlined" 
                  />
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Fill Settings</Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={showFilling} 
                  onChange={(e) => setShowFilling(e.target.checked)} 
                />
              }
              label="Show form filling process"
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Fill Speed</InputLabel>
              <Select
                value={fillSpeed}
                label="Fill Speed"
                onChange={(e) => setFillSpeed(Number(e.target.value))}
              >
                <MenuItem value={100}>Fast (100ms)</MenuItem>
                <MenuItem value={500}>Normal (500ms)</MenuItem>
                <MenuItem value={1000}>Slow (1000ms)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {form.fields.map(field => (
              <Box key={field.name} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={field.label || field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange(field.name)}
                  required={field.required}
                  type={field.type === 'email' ? 'email' : 'text'}
                  multiline={field.type === 'textarea'}
                  rows={field.type === 'textarea' ? 4 : 1}
                  disabled={analyzing}
                />
              </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleFill}
                disabled={analyzing}
              >
                Fill Dummy Data
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Filling Form...
                  </>
                ) : (
                  'Fill Form'
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
