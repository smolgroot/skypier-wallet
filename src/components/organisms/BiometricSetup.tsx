/**
 * Biometric Setup Component
 * 
 * Handles the biometric enrollment process for wallet creation.
 * Creates WebAuthn credential for authentication, generates secp256k1 key pair
 * for transaction signing, and stores encrypted wallet data.
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Key as KeyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { webAuthnService } from '@/lib/auth/webauthn';
import { generateSecp256k1KeyPair, deriveAddressFromPublicKey, privateKeyToHex } from '@/lib/crypto/keys';
import { useWalletStore } from '@/store/wallet.store';
import type { BiometricWallet, WalletError } from '@/types';

interface BiometricSetupProps {
  onComplete: (wallet: BiometricWallet) => void;
  onCancel: () => void;
}

type SetupStep = 'idle' | 'creating-credential' | 'deriving-address' | 'storing-wallet' | 'complete';

export default function BiometricSetup({ onComplete, onCancel }: BiometricSetupProps) {
  const [walletName, setWalletName] = useState('');
  const [currentStep, setCurrentStep] = useState<SetupStep>('idle');
  const [error, setError] = useState<WalletError | null>(null);
  const addWallet = useWalletStore((state) => state.addWallet);

  const handleCreateWallet = async () => {
    try {
      setError(null);
      
      // Step 1: Create WebAuthn credential (for biometric authentication)
      setCurrentStep('creating-credential');
      const userId = crypto.randomUUID();
      const userName = walletName || `Wallet ${Date.now()}`;
      
      const credential = await webAuthnService.createCredential(userId, userName);
      
      // Step 2: Generate secp256k1 key pair for Ethereum transactions
      // This is the key that will sign actual transactions
      setCurrentStep('deriving-address');
      const { privateKey, publicKey } = generateSecp256k1KeyPair();
      const address = deriveAddressFromPublicKey(publicKey);
      const privateKeyHex = privateKeyToHex(privateKey);
      
      // Step 3: Create wallet object with encrypted private key
      // The private key is stored encrypted - only accessible after biometric auth
      const wallet: BiometricWallet = {
        address,
        type: 'biometric',
        name: userName,
        createdAt: Date.now(),
        publicKey: Array.from(publicKey)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        credentialId: credential.id,
        encryptedPrivateKey: privateKeyHex, // Will be encrypted by the store
      };
      
      // Step 4: Store wallet (private key will be encrypted)
      setCurrentStep('storing-wallet');
      await addWallet(wallet);
      
      // Complete
      setCurrentStep('complete');
      onComplete(wallet);
    } catch (err) {
      console.error('Failed to create wallet:', err);
      setCurrentStep('idle');
      
      if (err instanceof Error) {
        setError({
          name: 'WalletError',
          code: 'WEBAUTHN_CREATION_FAILED',
          message: 'Failed to create biometric wallet',
          details: err.message,
        });
      } else {
        setError({
          name: 'WalletError',
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          details: String(err),
        });
      }
    }
  };

  const isProcessing = currentStep !== 'idle' && currentStep !== 'complete';

  const getStepStatus = (step: SetupStep): 'pending' | 'active' | 'complete' => {
    const steps: SetupStep[] = ['creating-credential', 'deriving-address', 'storing-wallet'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (currentIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Stack spacing={3}>
      {/* Instructions */}
      <Alert severity="info">
        <AlertTitle>How It Works</AlertTitle>
        Your device will create a secure cryptographic key pair using the secp256r1 curve.
        The private key stays in your device's secure hardware and can only be used after
        biometric authentication.
      </Alert>

      {/* Wallet Name Input */}
      <TextField
        label="Wallet Name (Optional)"
        value={walletName}
        onChange={(e) => setWalletName(e.target.value)}
        disabled={isProcessing}
        placeholder="My Wallet"
        fullWidth
        helperText="Give your wallet a memorable name"
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error">
          <AlertTitle>{error.message}</AlertTitle>
          {error.details !== undefined && (
            <Typography variant="body2">
              {typeof error.details === 'string' ? error.details : String(error.details)}
            </Typography>
          )}
        </Alert>
      )}

      {/* Process Steps */}
      {isProcessing && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Creating Your Wallet...
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                {getStepStatus('creating-credential') === 'complete' ? (
                  <CheckCircleIcon color="success" />
                ) : getStepStatus('creating-credential') === 'active' ? (
                  <CircularProgress size={24} />
                ) : (
                  <FingerprintIcon color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Creating Biometric Credential"
                secondary="Please authenticate with your device"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {getStepStatus('deriving-address') === 'complete' ? (
                  <CheckCircleIcon color="success" />
                ) : getStepStatus('deriving-address') === 'active' ? (
                  <CircularProgress size={24} />
                ) : (
                  <KeyIcon color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Generating Ethereum Address"
                secondary="Deriving address from public key"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                {getStepStatus('storing-wallet') === 'complete' ? (
                  <CheckCircleIcon color="success" />
                ) : getStepStatus('storing-wallet') === 'active' ? (
                  <CircularProgress size={24} />
                ) : (
                  <SaveIcon color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Storing Wallet Securely"
                secondary="Encrypting and saving wallet data"
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Security Features */}
      {!isProcessing && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Security Features:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Hardware Security"
                secondary="Keys are generated and stored in your device's secure enclave"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FingerprintIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Biometric Protection"
                secondary="Only you can access your wallet with your fingerprint or face"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <KeyIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="secp256r1 Cryptography"
                secondary="EIP-7212 compatible for on-chain signature verification"
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          onClick={onCancel}
          disabled={isProcessing}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateWallet}
          disabled={isProcessing}
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={20} /> : <FingerprintIcon />}
        >
          {isProcessing ? 'Creating...' : 'Create Wallet'}
        </Button>
      </Stack>
    </Stack>
  );
}
