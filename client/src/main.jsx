import { createRoot } from 'react-dom/client'
import React from 'react'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './registerServiceWorker.js'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)

// Register progressive web app service worker for offline capability and fast caching
registerServiceWorker({
  onUpdate: () => {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onSuccess: () => {
    console.log('[PWA] whitedavid23 is ready to work offline.');
  }
});
