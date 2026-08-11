import { QueryClientProvider, hydrate } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from './App';
import { AuthProvider } from './features/auth/AuthContext';
import { createQueryClient } from './queryClient';

const queryClient = createQueryClient();

if (window.__INITIAL_DATA__) {
  hydrate(queryClient, window.__INITIAL_DATA__);
}

const root = document.getElementById('root')!;

hydrateRoot(
  root,
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

root.classList.add('ready');
document.getElementById('app-loader')?.remove();
