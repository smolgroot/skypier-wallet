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

  function handleGetStarted() {
    if (capabilities.platformAuthenticatorAvailable) {
      navigate('/create-wallet');
    }
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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to SkypierWallet
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            The future of secure, biometric-enabled Ethereum wallets
          </Typography>
          <Chip
            label="Powered by EIP-7212"
            color="primary"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Device Capability Status */}
        {renderCapabilityStatus()}

        {/* Features */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Why SkypierWallet?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Hardware-Level Security"
                  secondary="Your private keys are generated and stored in your device's secure enclave using secp256r1 cryptography"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FingerprintIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Biometric Authentication"
                  secondary="Unlock your wallet with Face ID, Touch ID, or other biometric methods - no passwords to remember"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="EIP-7212 Compatible"
                  secondary="Leverages Ethereum's Fusaka upgrade for native secp256r1 signature verification on-chain"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* What You'll Need */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              What You'll Need
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color={capabilities.webAuthnSupported ? 'success' : 'disabled'} fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="WebAuthn-compatible browser"
                  secondary="Chrome, Firefox, Safari, or Edge"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon
                    color={capabilities.platformAuthenticatorAvailable ? 'success' : 'disabled'}
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Biometric authenticator"
                  secondary="Face ID, Touch ID, Windows Hello, or Android Biometric"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="A few minutes of your time"
                  secondary="The setup process is quick and easy"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            disabled={!capabilities.platformAuthenticatorAvailable || capabilities.isLoading}
            startIcon={<FingerprintIcon />}
          >
            Create Biometric Wallet
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/import-wallet')}
            disabled={capabilities.isLoading}
          >
            Import Existing Wallet
          </Button>
        </Stack>

        {/* Security Note */}
        <Alert severity="info" variant="outlined">
          <AlertTitle>Security Note</AlertTitle>
          SkypierWallet stores your private keys securely on your device. They never leave your
          device and are protected by your biometric authentication. Make sure to back up your
          recovery phrase in a secure location.
        </Alert>
      </Stack>
    </Container>
  );
}
