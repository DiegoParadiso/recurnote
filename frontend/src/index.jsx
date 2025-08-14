import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Detector de memory leaks deshabilitado temporalmente para debugging
// if (process.env.NODE_ENV === 'development') {
//   import('./utils/simpleMemoryChecker.js');
// }

// Optimizaciones de rendimiento
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
