/**
 * Wallet Selector Modal Component
 * 
 * Modal dialog for switching between wallets.
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Jazzicon from '@/components/atoms/Jazzicon';
import type { Wallet } from '@/types';

interface WalletSelectorModalProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  activeAddress: string;
  onSelectWallet: (address: string) => void;
}

export default function WalletSelectorModal({
  open,
  onClose,
  wallets,
  activeAddress,
  onSelectWallet,
}: WalletSelectorModalProps) {
  const navigate = useNavigate();

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleAddWallet = () => {
    onClose();
    navigate('/create-wallet');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Your Wallets
        </Typography>
        <IconButton onClick={onClose} edge="end" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={1.5}>
          {wallets.map((wallet) => {
            const isActive = wallet.address === activeAddress;

            return (
              <Box
                key={wallet.address}
                onClick={() => {
                  onSelectWallet(wallet.address);
                  onClose();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  border: 2,
                  borderColor: isActive ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isActive ? 'action.selected' : 'action.hover',
                  },
                }}
              >
                <Jazzicon address={wallet.address} size={44} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={600} noWrap>
                    {wallet.name || 'Wallet'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {formatAddress(wallet.address)}
                  </Typography>
                </Box>

                {isActive && (
                  <CheckCircleIcon color="primary" />
                )}
              </Box>
            );
          })}

          {/* Add Wallet Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddWallet}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
            }}
          >
            Add New Wallet
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
