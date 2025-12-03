import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/roboto-slab/100.css';
import '@fontsource/roboto-slab/200.css';
import '@fontsource/roboto-slab/300.css';
import '@fontsource/roboto-slab/400.css';
import '@fontsource/roboto-slab/500.css';
import '@fontsource/roboto-slab/600.css';
import '@fontsource/roboto-slab/700.css';
import '@fontsource/roboto-slab/800.css';
import '@fontsource/roboto-slab/900.css';
import '@styles/resize-handle.css';
import './i18n/index.js';
import { setupFetchTimeout } from './utils/setupFetchTimeout.js';
import App from './App.jsx';

// Initialize global fetch timeout and 408 redirect handler
setupFetchTimeout();

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);