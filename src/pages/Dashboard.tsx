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
  const setActiveWallet = useWalletStore((state) => state.setActiveWallet);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

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
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3} alignItems="center">
          <FingerprintIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'primary.main' }} />
          <Typography 
            variant="h4" 
            textAlign="center"
            sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
          >
            Wallet Locked
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center"
            sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            Authenticate with your biometric to unlock your wallets.
          </Typography>
          
          {unlockError && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {unlockError}
            </Alert>
          )}
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={handleUnlock}
              disabled={unlocking}
              startIcon={unlocking ? <CircularProgress size={20} /> : <FingerprintIcon />}
              sx={{ py: 1.5 }}
            >
              {unlocking ? 'Unlocking...' : 'Unlock Wallet'}
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => navigate('/')}
              sx={{ py: 1.5 }}
            >
              Back
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

  const handleSwitchWallet = (address: string) => {
    setActiveWallet(address);
    setShowWalletSelector(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Active Wallet Card */}
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={2}>
              {/* Wallet Selector Button */}
              {wallets.length > 1 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowWalletSelector(!showWalletSelector)}
                  sx={{ alignSelf: 'flex-start', mb: 1 }}
                >
                  {showWalletSelector ? 'Hide' : 'Switch'} Wallet
                </Button>
              )}
              
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                  <WalletIcon fontSize="large" color="primary" sx={{ flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {activeWallet.name || 'Unnamed Wallet'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      fontFamily="monospace"
                      sx={{ 
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
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
                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  0.00 ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ $0.00 USD
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Wallet Selector */}
        {showWalletSelector && wallets.length > 1 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Select Wallet:
              </Typography>
              <Stack spacing={1}>
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
                      border: wallet.address === activeWallet.address ? 2 : 1,
                      borderColor: wallet.address === activeWallet.address ? 'primary.main' : 'divider',
                    }}
                    onClick={() => handleSwitchWallet(wallet.address)}
                  >
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {wallet.name || 'Unnamed Wallet'}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontFamily="monospace"
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {formatAddress(wallet.address)}
                          </Typography>
                        </Box>
                        <Chip
                          label={wallet.type === 'biometric' ? 'Bio' : 'Imported'}
                          size="small"
                          variant={wallet.address === activeWallet.address ? 'filled' : 'outlined'}
                          color={wallet.address === activeWallet.address ? 'primary' : 'default'}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-wallet')}
          >
            Add Wallet
          </Button>
        </Stack>

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
