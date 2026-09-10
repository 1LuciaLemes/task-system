import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { DragProvider } from './state/DragState.js';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento #root');
}

createRoot(container).render(
  <StrictMode>
    <DragProvider>
      <App />
    </DragProvider>
  </StrictMode>,
);