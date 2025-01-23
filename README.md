# AI-Powered Form Field Analyzer and Filler

An intelligent application that helps testers analyze, classify, and prefill form fields on web applications using AI-generated data.

## Features

- **URL Analysis**: Analyze web pages to identify and classify form fields
- **AI-Powered Data Generation**: Generate contextual test data for form fields
- **Automated Form Filling**: Automatically fill forms with generated data
- **Form Submission**: Automate form submission and capture responses
- **Interactive UI**: User-friendly interface for managing form analysis and filling

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for UI components
- React Hook Form for form management
- Zod for validation
- Axios for API communication

### Backend
- Node.js with Express
- OpenAI API for data generation
- Playwright for web automation
- TypeScript for type safety

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd form-filler-app
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# In backend directory
cp .env.example .env
# Add your OpenAI API key and other required variables
```

4. Start the development servers:
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## Usage

1. Enter the URL of the web form you want to analyze
2. Review the detected form fields and their classifications
3. Generate AI-powered test data for the fields
4. Preview and modify the generated data if needed
5. Submit the form and view the results

## Development

### Project Structure

```
form-filler-app/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── store/     # State management
│   │   └── utils/     # Utility functions
│   └── ...
├── backend/           # Node.js backend application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utility functions
│   └── ...
└── shared/           # Shared types and utilities
