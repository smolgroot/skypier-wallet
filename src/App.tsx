/**
 * App Root Component
 * 
 * Main application component with routing and theme provider.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { createAppTheme } from '@/theme';
import { useWalletStore } from '@/store/wallet.store';
import Welcome from '@/pages/Welcome';
import CreateWallet from '@/pages/CreateWallet';

function App() {
  const initialize = useWalletStore((state) => state.initialize);
  const theme = createAppTheme('dark'); // TODO: Add theme toggle

  // Initialize wallet store on app load
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create-wallet" element={<CreateWallet />} />
          {/* TODO: Add more routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
