/**
 * Welcome Page
 * 
 * Landing page for new users introducing SkypierWallet and checking
 * device capabilities for biometric authentication.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { webAuthnService } from '@/lib/auth/webauthn';
import { hasStoredWallets } from '@/lib/storage/encrypted';
import { useWalletStore } from '@/store/wallet.store';

interface DeviceCapabilities {
  webAuthnSupported: boolean;
  platformAuthenticatorAvailable: boolean;
  isLoading: boolean;
}

export default function Welcome() {
  const navigate = useNavigate();
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    webAuthnSupported: false,
    platformAuthenticatorAvailable: false,
    isLoading: true,
  });
  const [hasExistingWallets, setHasExistingWallets] = useState(false);
  const wallets = useWalletStore((state) => state.wallets);
  const isLocked = useWalletStore((state) => state.isLocked);

  const checkDeviceCapabilities = async () => {
    try {
      const webAuthnSupported = webAuthnService.isAvailable();
      const platformAuthenticatorAvailable = webAuthnSupported
        ? await webAuthnService.isPlatformAuthenticatorAvailable()
        : false;

      setCapabilities({
        webAuthnSupported,
        platformAuthenticatorAvailable,
        isLoading: false,
      });
      
      // Check if wallets exist in storage
      setHasExistingWallets(hasStoredWallets());
    } catch (error) {
      console.error('Failed to check device capabilities:', error);
      setCapabilities({
        webAuthnSupported: false,
        platformAuthenticatorAvailable: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    void checkDeviceCapabilities();
  }, []);
  
  // Redirect to dashboard if already unlocked with wallets
  useEffect(() => {
    if (wallets.length > 0 && !isLocked) {
      navigate('/dashboard');
    }
  }, [wallets, isLocked, navigate]);

  function handleGetStarted() {
    if (capabilities.platformAuthenticatorAvailable) {
      navigate('/create-wallet');
    }
  }
  
  function handleUnlock() {
    // For now, navigate to dashboard which will show unlock UI
    navigate('/dashboard');
  }

  function renderCapabilityStatus() {
    if (capabilities.isLoading) {
      return (
        <Alert severity="info">
          <AlertTitle>Checking Device Capabilities</AlertTitle>
          Please wait while we check if your device supports biometric authentication...
        </Alert>
      );
    }

    if (!capabilities.webAuthnSupported) {
      return (
        <Alert severity="error" icon={<ErrorIcon />}>
          <AlertTitle>WebAuthn Not Supported</AlertTitle>
          Your browser doesn't support WebAuthn, which is required for biometric wallet creation.
          Please use a modern browser like Chrome, Firefox, Safari, or Edge.
        </Alert>
      );
    }

    if (!capabilities.platformAuthenticatorAvailable) {
      return (
        <Alert severity="warning" icon={<WarningIcon />}>
          <AlertTitle>Biometric Authentication Unavailable</AlertTitle>
          Your device doesn't have a biometric authenticator (like Face ID or Touch ID) available.
          You can still import an existing wallet using a private key.
        </Alert>
      );
    }

    return (
      <Alert severity="success" icon={<CheckCircleIcon />}>
        <AlertTitle>Device Ready</AlertTitle>
        Your device supports biometric authentication! You can create a secure wallet protected
        by your fingerprint or face.
      </Alert>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Welcome to SkypierWallet
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Secure, biometric-enabled Ethereum wallet
          </Typography>
          <Chip
            label="Powered by EIP-7212"
            color="primary"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* CTA Buttons - Moved to top */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          {hasExistingWallets ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={handleUnlock}
                disabled={!capabilities.platformAuthenticatorAvailable || capabilities.isLoading}
                startIcon={<FingerprintIcon />}
                sx={{ py: 1.5, px: 4 }}
              >
                Unlock Wallet
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleGetStarted}
                disabled={!capabilities.platformAuthenticatorAvailable || capabilities.isLoading}
                sx={{ py: 1.5, px: 4 }}
              >
                Create New Wallet
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                disabled={!capabilities.platformAuthenticatorAvailable || capabilities.isLoading}
                startIcon={<FingerprintIcon />}
                sx={{ py: 1.5, px: 4 }}
              >
                Create Biometric Wallet
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/import-wallet')}
                disabled={capabilities.isLoading}
                sx={{ py: 1.5, px: 4 }}
              >
                Import Existing Wallet
              </Button>
            </>
          )}
        </Stack>

        {/* Device Capability Status */}
        {renderCapabilityStatus()}

        {/* Collapsible Features - Less prominent */}
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: 2, cursor: 'pointer' }}
          >
            Learn more ↓
          </Typography>
          <Stack spacing={2}>
            <Card elevation={1} sx={{ display: { xs: 'none', md: 'block' } }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Key Features
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hardware-Level Security"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondary="Keys stored in secure enclave with secp256r1"
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FingerprintIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Biometric Authentication"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondary="No passwords to remember"
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="EIP-7212 Compatible"
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondary="Native on-chain signature verification"
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
