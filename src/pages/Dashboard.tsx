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
  CheckCircle as CheckCircleIcon,
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
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2
        }}
      >
        <Container maxWidth="sm">
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
      </Box>
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header with Wallet Info */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 2 }}>
            <Stack spacing={2}>
              {/* Wallet Address with Dropdown */}
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1.5}
                sx={{ cursor: wallets.length > 1 ? 'pointer' : 'default' }}
                onClick={() => wallets.length > 1 && setShowWalletSelector(!showWalletSelector)}
              >
                <WalletIcon color="primary" sx={{ fontSize: 32 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {activeWallet.name || 'Wallet'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography 
                      variant="body1" 
                      fontFamily="monospace"
                      fontWeight="medium"
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {formatAddress(activeWallet.address)}
                    </Typography>
                    {wallets.length > 1 && (
                      <Box 
                        component="span" 
                        sx={{ 
                          transform: showWalletSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ▼
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Chip
                  label={activeWallet.type === 'biometric' ? 'Bio' : 'Imported'}
                  color="primary"
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              </Stack>

              {/* Balance */}
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}
                >
                  0.00 ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ $0.00 USD
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>

        {/* Wallet Selector Dropdown */}
        {showWalletSelector && wallets.length > 1 && (
          <Box 
            sx={{ 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ py: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Switch Wallet
                </Typography>
                <Stack spacing={1}>
                  {wallets.map((wallet) => (
                    <Box
                      key={wallet.address}
                      onClick={() => handleSwitchWallet(wallet.address)}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: wallet.address === activeWallet.address ? 'action.selected' : 'transparent',
                        border: 1,
                        borderColor: wallet.address === activeWallet.address ? 'primary.main' : 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {wallet.name || 'Unnamed Wallet'}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontFamily="monospace"
                          >
                            {formatAddress(wallet.address)}
                          </Typography>
                        </Box>
                        {wallet.address === activeWallet.address && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Container>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
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
    </Box>
  );
}
