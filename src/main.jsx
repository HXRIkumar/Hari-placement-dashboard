import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CompanyProvider } from './context/CompanyContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </StrictMode>
);
