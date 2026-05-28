"use client";

import App from '../App';
import { CompanyProvider } from '../context/CompanyContext';

export default function Page() {
  return (
    <CompanyProvider>
      <App />
    </CompanyProvider>
  );
}
