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
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
          >
            Create Biometric Wallet
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            Set up a secure wallet protected by your device's biometric authentication
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3, display: { xs: 'none', sm: 'flex' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Mobile progress indicator */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>

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
