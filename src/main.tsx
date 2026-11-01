import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './lib/store';
import { App } from './App';

if (window.self !== window.top) document.documentElement.classList.add('is-embedded');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
