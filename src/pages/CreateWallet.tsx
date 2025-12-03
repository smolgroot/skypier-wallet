/**
 * Create Wallet Page
 * 
 * Multi-step flow for creating a new biometric wallet with WebAuthn.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
} from '@mui/material';
import BiometricSetup from '@/components/organisms/BiometricSetup';
import WalletCreated from '@/components/organisms/WalletCreated';
import type { BiometricWallet } from '@/types';

const steps = ['Biometric Setup', 'Wallet Created'];

export default function CreateWallet() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [createdWallet, setCreatedWallet] = useState<BiometricWallet | null>(null);

  const handleBiometricComplete = (wallet: BiometricWallet) => {
    setCreatedWallet(wallet);
    setActiveStep(1);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Create Biometric Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set up a secure wallet protected by your device's biometric authentication
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box>
          {activeStep === 0 && (
            <BiometricSetup
              onComplete={handleBiometricComplete}
              onCancel={handleCancel}
            />
          )}
          {activeStep === 1 && createdWallet && (
            <WalletCreated
              wallet={createdWallet}
              onFinish={handleFinish}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
}
