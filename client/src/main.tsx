import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.tsx';
import BrowserCompatibilityCheck from './components/BrowserCompatibilityCheck.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserCompatibilityCheck>
      <Router>
        <App />
      </Router>
      <Toaster theme="dark" richColors position="top-center" />
    </BrowserCompatibilityCheck>
  </StrictMode>
);
