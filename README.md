# PRISM Games

A modern web application built with React, TypeScript, and Vite, featuring client-side routing between a home page and credits page.

## Features

- ⚡️ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Modern React with latest features
- 📘 **TypeScript** - Type-safe development
- 🚀 **React Router** - Client-side routing between pages
- 🎨 **Modern CSS** - Clean, responsive styling with gradients

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx      # Home page component
│   └── Credits.tsx   # Credits page component
├── App.tsx           # Main app component with routing
├── App.css           # Global styles
└── main.tsx          # Application entry point
```

## Navigation

- **Home Page** (`/`) - Welcome page with navigation to credits
- **Credits Page** (`/credits`) - Information about the project and contributors

## Technologies Used

- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Fast build tool and development server
- **React Router DOM** - Declarative routing for React applications
- **ESLint** - Code linting and formatting

## Development Notes

This project uses Vite's fast HMR (Hot Module Replacement) for instant updates during development. The TypeScript configuration is set up for strict type checking to ensure code quality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
