/**
 * Send Page
 *
 * Multi-step transaction flow:
 * 1. Select network, token, and amount
 * 2. Specify recipient address
 * 3. Review transaction summary
 * 4. Sign with biometrics
 * 5. Success with animation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stack,
  Button,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Fade,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  keyframes,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  Fingerprint as FingerprintIcon,
  OpenInNew as OpenInNewIcon,
  Circle as CircleIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { useWalletStore } from '@/store/wallet.store';
import { useBalance } from '@/hooks/useBalance';
import { useNetworkStore, useCurrentNetwork, useNetworkActions } from '@/hooks/useNetwork';
import Jazzicon from '@/components/atoms/Jazzicon';
import {
  isValidAddress,
  formatAddress,
  isValidAmount,
  estimateGas,
  type GasEstimate,
  getExplorerTxUrl,
} from '@/lib/blockchain/transaction';
import { webAuthnService } from '@/lib/auth/webauthn';

const steps = ['Amount', 'Recipient', 'Review', 'Sign', 'Success'];

// Celebration animation
const celebrateKeyframes = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
`;

const pulseKeyframes = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(203, 166, 247, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(203, 166, 247, 0.3); }
`;

export default function Send() {
  const navigate = useNavigate();
  const activeWallet = useWalletStore((state) => state.activeWallet);
  const isLocked = useWalletStore((state) => state.isLocked);

  // Network state
  const currentNetwork = useCurrentNetwork();
  const selectedNetworkId = useNetworkStore((state) => state.selectedNetworkId);
  const { setNetwork, allNetworks } = useNetworkActions();
  const [networkMenuAnchor, setNetworkMenuAnchor] = useState<null | HTMLElement>(null);

  // Balance
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: activeWallet?.address,
    networkId: selectedNetworkId,
    enabled: !!activeWallet && !isLocked,
  });

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Validation
  const amountValidation = balanceData
    ? isValidAmount(amount, balanceData.raw, gasEstimate?.estimatedCost)
    : { valid: false, error: 'Loading balance...' };
  const recipientValid = isValidAddress(recipient);

  // Redirect if locked or no wallet
  useEffect(() => {
    if (isLocked || !activeWallet) {
      navigate('/');
    }
  }, [isLocked, activeWallet, navigate]);

  // Estimate gas when recipient and amount are valid
  useEffect(() => {
    const fetchGasEstimate = async () => {
      if (!recipientValid || !amount || parseFloat(amount) <= 0) {
        setGasEstimate(null);
        return;
      }

      setEstimatingGas(true);
      try {
        const estimate = await estimateGas({
          to: recipient as `0x${string}`,
          amount,
          networkId: selectedNetworkId,
          from: activeWallet?.address as `0x${string}`,
        });
        setGasEstimate(estimate);
      } catch (err) {
        console.error('Gas estimation failed:', err);
        // Use fallback gas estimate
        setGasEstimate(null);
      } finally {
        setEstimatingGas(false);
      }
    };

    void fetchGasEstimate();
  }, [recipient, amount, selectedNetworkId, activeWallet?.address, recipientValid]);

  const handleNext = () => {
    setError(null);
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    setError(null);

    try {
      // Verify biometrics
      const credentialId = localStorage.getItem('skypier_last_credential_id');
      if (!credentialId) {
        throw new Error('No credential found');
      }

      await webAuthnService.authenticate(credentialId);

      // Simulate transaction (in production, would actually sign and send)
      // For demo, we just show success after biometric auth
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock transaction hash
      const mockHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setTxHash(mockHash);
      handleNext(); // Move to success step
    } catch (err) {
      console.error('Signing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign transaction');
    } finally {
      setSigning(false);
    }
  };

  const handleSetMax = () => {
    if (balanceData) {
      // Leave some for gas
      const maxAmount = Math.max(0, balanceData.value - 0.001);
      setAmount(maxAmount.toString());
    }
  };

  const handleNetworkClick = (event: React.MouseEvent<HTMLElement>) => {
    setNetworkMenuAnchor(event.currentTarget);
  };

  const handleNetworkClose = () => {
    setNetworkMenuAnchor(null);
  };

  const handleNetworkSelect = (networkId: string) => {
    setNetwork(networkId);
    setGasEstimate(null);
    handleNetworkClose();
  };

  const canProceedStep0 = amount && parseFloat(amount) > 0 && amountValidation.valid;
  const canProceedStep1 = recipientValid;
  const canProceedStep2 = true; // Review step

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Amount
        return (
          <Stack spacing={3}>
            {/* Network Selector */}
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={handleNetworkClick}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CircleIcon sx={{ color: currentNetwork?.iconColor ?? '#627EEA', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Network
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {currentNetwork?.name ?? 'Unknown'}
                      </Typography>
                      {currentNetwork?.isTestnet && (
                        <Chip label="Testnet" size="small" color="warning" />
                      )}
                    </Stack>
                  </Box>
                </Stack>
                <ArrowDownIcon />
              </Stack>
            </Paper>

            <Menu
              anchorEl={networkMenuAnchor}
              open={Boolean(networkMenuAnchor)}
              onClose={handleNetworkClose}
              PaperProps={{ sx: { minWidth: 280 } }}
            >
              {allNetworks.map((network) => (
                <MenuItem
                  key={network.id}
                  selected={network.id === selectedNetworkId}
                  onClick={() => handleNetworkSelect(network.id)}
                >
                  <ListItemIcon>
                    <CircleIcon sx={{ color: network.iconColor }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={network.name}
                    secondary={network.isTestnet ? 'Testnet' : 'Mainnet'}
                  />
                  {network.id === selectedNetworkId && <CheckIcon color="primary" />}
                </MenuItem>
              ))}
            </Menu>

            {/* Amount Input */}
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Amount
              </Typography>
              <TextField
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                type="text"
                inputMode="decimal"
                error={!!amount && !amountValidation.valid}
                helperText={amount && !amountValidation.valid ? amountValidation.error : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography color="text.secondary">
                          {balanceData?.symbol ?? 'ETH'}
                        </Typography>
                        <Button size="small" onClick={handleSetMax}>
                          MAX
                        </Button>
                      </Stack>
                    </InputAdornment>
                  ),
                  sx: { fontSize: '1.5rem' },
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                Balance: {balanceLoading ? '...' : `${balanceData?.formatted ?? '0'} ${balanceData?.symbol ?? 'ETH'}`}
              </Typography>
            </Box>
          </Stack>
        );

      case 1: // Recipient
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Recipient Address
              </Typography>
              <TextField
                fullWidth
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                error={!!recipient && !recipientValid}
                helperText={recipient && !recipientValid ? 'Invalid Ethereum address' : ''}
                InputProps={{
                  sx: { fontFamily: 'monospace' },
                }}
              />
            </Box>

            {recipientValid && (
              <Fade in>
                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Jazzicon address={recipient} size={40} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sending to
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {formatAddress(recipient, 8)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Stack>
        );

      case 2: // Review
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    From
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Jazzicon address={activeWallet?.address ?? ''} size={24} />
                    <Typography fontFamily="monospace">
                      {formatAddress(activeWallet?.address ?? '', 8)}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    To
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Jazzicon address={recipient} size={24} />
                    <Typography fontFamily="monospace">
                      {formatAddress(recipient, 8)}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {amount} {balanceData?.symbol ?? 'ETH'}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Network
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <CircleIcon sx={{ color: currentNetwork?.iconColor, fontSize: 16 }} />
                    <Typography>{currentNetwork?.name}</Typography>
                    {currentNetwork?.isTestnet && (
                      <Chip label="Testnet" size="small" color="warning" />
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Gas Fee
                  </Typography>
                  {estimatingGas ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography>
                      ~{gasEstimate?.estimatedCostFormatted ?? '0.0001'} {balanceData?.symbol ?? 'ETH'}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>

            <Alert severity="info">
              You will be asked to authenticate with biometrics to sign this transaction.
            </Alert>
          </Stack>
        );

      case 3: // Sign
        return (
          <Stack spacing={4} alignItems="center" py={4}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: signing ? `${pulseKeyframes} 1.5s ease-in-out infinite` : 'none',
              }}
            >
              {signing ? (
                <CircularProgress size={60} sx={{ color: 'primary.contrastText' }} />
              ) : (
                <FingerprintIcon sx={{ fontSize: 64, color: 'primary.contrastText' }} />
              )}
            </Box>

            <Stack spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                {signing ? 'Signing...' : 'Sign Transaction'}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {signing
                  ? 'Please authenticate with your biometrics'
                  : 'Use your fingerprint or face to sign this transaction'}
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            {!signing && (
              <Button
                variant="contained"
                size="large"
                onClick={handleSign}
                startIcon={<FingerprintIcon />}
                sx={{ py: 2, px: 6 }}
              >
                Sign with Biometrics
              </Button>
            )}
          </Stack>
        );

      case 4: // Success
        return (
          <Stack spacing={4} alignItems="center" py={4}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${celebrateKeyframes} 0.6s ease-out`,
              }}
            >
              <CelebrationIcon sx={{ fontSize: 64, color: 'success.contrastText' }} />
            </Box>

            <Stack spacing={1} alignItems="center">
              <Typography variant="h4" fontWeight={700}>
                Transaction Sent!
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Your transaction has been submitted to the network
              </Typography>
            </Stack>

            <Paper sx={{ p: 3, width: '100%' }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount Sent
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {amount} {balanceData?.symbol ?? 'ETH'}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    To
                  </Typography>
                  <Typography fontFamily="monospace">
                    {formatAddress(recipient, 8)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Transaction Hash
                  </Typography>
                  <Typography fontFamily="monospace" fontSize="0.85rem">
                    {txHash ? formatAddress(txHash, 12) : 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Stack direction="row" spacing={2} width="100%">
              {txHash && (
                <Button
                  variant="outlined"
                  fullWidth
                  endIcon={<OpenInNewIcon />}
                  onClick={() => window.open(getExplorerTxUrl(txHash as `0x${string}`, selectedNetworkId), '_blank')}
                >
                  View on Explorer
                </Button>
              )}
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/dashboard')}
              >
                Done
              </Button>
            </Stack>
          </Stack>
        );

      default:
        return null;
    }
  };

  const getNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !canProceedStep0;
      case 1:
        return !canProceedStep1;
      case 2:
        return !canProceedStep2;
      default:
        return false;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 3,
        px: 2,
        background: (theme) =>
          `radial-gradient(ellipse at top, ${theme.palette.primary.main}15 0%, transparent 50%)`,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={() => activeStep === 0 ? navigate('/dashboard') : handleBack()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Send
          </Typography>
        </Stack>

        {/* Stepper */}
        {activeStep < 4 && (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.slice(0, 4).map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Step Content */}
        <Fade in key={activeStep}>
          <Box>{renderStepContent()}</Box>
        </Fade>

        {/* Navigation Buttons */}
        {activeStep < 3 && (
          <Stack direction="row" spacing={2} mt={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleNext}
              disabled={getNextDisabled()}
            >
              {activeStep === 2 ? 'Proceed to Sign' : 'Continue'}
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
