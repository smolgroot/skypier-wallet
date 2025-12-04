/**
 * Dashboard Page
 * 
 * Main wallet dashboard showing balance, transactions, and wallet management.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material';
import { useWalletStore, walletSelectors } from '@/store/wallet.store';

export default function Dashboard() {
  const navigate = useNavigate();
  const activeWallet = useWalletStore((state) => state.activeWallet);
  const wallets = useWalletStore((state) => state.wallets);
  const hasWallets = useWalletStore(walletSelectors.hasWallets);
  const isLocked = useWalletStore((state) => state.isLocked);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Redirect to welcome only if no wallets exist at all (not just locked)
  useEffect(() => {
    if (!hasWallets && !isLocked) {
      // Only redirect if truly no wallets, not just locked
      navigate('/');
    }
  }, [hasWallets, isLocked, navigate]);
  
  const handleUnlock = async () => {
    setUnlocking(true);
    setUnlockError(null);
    
    try {
      // Get the last used credential ID from storage
      const lastCredentialId = localStorage.getItem('skypier_last_credential_id');
      
      if (!lastCredentialId) {
        // If no credential ID, we need to get it somehow
        // For now, navigate back to welcome
        setUnlockError('No credential found. Please create a new wallet.');
        return;
      }
      
      // Try to unlock with the last credential
      await useWalletStore.getState().unlock(lastCredentialId);
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockError(error instanceof Error ? error.message : 'Failed to unlock wallet');
    } finally {
      setUnlocking(false);
    }
  };

  // If locked, we should have wallets but they're encrypted
  if (isLocked) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4} alignItems="center">
          <FingerprintIcon sx={{ fontSize: 80, color: 'primary.main' }} />
          <Typography variant="h4">Wallet Locked</Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Your wallet is locked. Authenticate with your biometric to unlock.
          </Typography>
          
          {unlockError && (
            <Alert severity="error" sx={{ maxWidth: 500 }}>
              {unlockError}
            </Alert>
          )}
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              onClick={handleUnlock}
              disabled={unlocking}
              startIcon={unlocking ? <CircularProgress size={20} /> : <FingerprintIcon />}
            >
              {unlocking ? 'Unlocking...' : 'Unlock Wallet'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Stack>
        </Stack>
      </Container>
    );
  }

  if (!activeWallet) {
    return null;
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your biometric wallets
          </Typography>
        </Box>

        {/* Active Wallet Card */}
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <WalletIcon fontSize="large" color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {activeWallet.name || 'Unnamed Wallet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {formatAddress(activeWallet.address)}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={activeWallet.type === 'biometric' ? 'Biometric' : 'Imported'}
                  color="primary"
                  size="small"
                />
              </Stack>

              <Box>
                <Typography variant="h4" fontWeight="bold">
                  0.00 ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ $0.00 USD
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Wallet List */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              Your Wallets ({wallets.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-wallet')}
            >
              Add Wallet
            </Button>
          </Stack>

          <Stack spacing={2}>
            {wallets.map((wallet) => (
              <Card
                key={wallet.address}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  bgcolor: wallet.address === activeWallet.address ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {wallet.name || 'Unnamed Wallet'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {formatAddress(wallet.address)}
                      </Typography>
                    </Box>
                    <Chip
                      label={wallet.type === 'biometric' ? 'Biometric' : 'Imported'}
                      size="small"
                      variant={wallet.address === activeWallet.address ? 'filled' : 'outlined'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Coming Soon Features */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Coming Soon:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • Send and receive transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • View transaction history
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Manage tokens and NFTs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Connect to dApps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Multi-network support
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
