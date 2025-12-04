/**
 * App Root Component
 * 
 * Main application component with routing and theme provider.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createAppTheme } from '@/theme';
import { useWalletStore } from '@/store/wallet.store';
import Welcome from '@/pages/Welcome';
import CreateWallet from '@/pages/CreateWallet';
import Dashboard from '@/pages/Dashboard';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000, // 10 seconds
      gcTime: 5 * 60_000, // 5 minutes
    },
  },
});

function App() {
  const theme = createAppTheme('dark'); // TODO: Add theme toggle

  // Initialize wallet store on app load (once)
  useEffect(() => {
    void useWalletStore.getState().initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/create-wallet" element={<CreateWallet />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* TODO: Add more routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
