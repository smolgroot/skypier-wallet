/**
 * Wallet Created Component
 * 
 * Success screen showing the newly created wallet details.
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { BiometricWallet } from '@/types';

interface WalletCreatedProps {
  wallet: BiometricWallet;
  onFinish: () => void;
}

export default function WalletCreated({ wallet, onFinish }: WalletCreatedProps) {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (address: string): string => {
    if (showFullAddress) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Stack spacing={3}>
      {/* Success Message */}
      <Box textAlign="center">
        <CheckCircleIcon
          sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
        />
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Wallet Created Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your biometric wallet is ready to use
        </Typography>
      </Box>

      {/* Wallet Details Card */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {/* Wallet Name */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Wallet Name
              </Typography>
              <Typography variant="h6">
                {wallet.name || 'Unnamed Wallet'}
              </Typography>
            </Box>

            {/* Ethereum Address */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Ethereum Address
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={showFullAddress ? 'Hide full address' : 'Show full address'}>
                    <IconButton
                      size="small"
                      onClick={() => setShowFullAddress(!showFullAddress)}
                    >
                      {showFullAddress ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                    <IconButton
                      size="small"
                      onClick={handleCopyAddress}
                      color={copied ? 'success' : 'default'}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Typography
                variant="body1"
                fontFamily="monospace"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: 'action.hover',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {formatAddress(wallet.address)}
              </Typography>
            </Box>

            {/* Wallet Type */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Wallet Type
              </Typography>
              <Chip
                label="Biometric Wallet"
                color="primary"
                size="small"
                icon={<CheckCircleIcon />}
              />
            </Box>

            {/* Created Date */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(wallet.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert severity="warning">
        <AlertTitle>Important: Backup Information</AlertTitle>
        Your wallet is secured by your device's biometric authentication. If you lose access
        to this device or reset it, you will need a backup to recover your wallet. Make sure
        to export and securely store your recovery phrase.
      </Alert>

      {/* Next Steps */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Next Steps:
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">
              • Fund your wallet by sending ETH to your address
            </Typography>
            <Typography variant="body2">
              • Create a backup of your recovery phrase (coming soon)
            </Typography>
            <Typography variant="body2">
              • Connect to dApps using your biometric wallet
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          onClick={onFinish}
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
        >
          Go to Dashboard
        </Button>
      </Stack>
    </Stack>
  );
}
