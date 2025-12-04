/**
 * Dashboard Page
 * 
 * Rainbow-style wallet dashboard with tokens, NFTs, and wallet management.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ContentCopy as CopyIcon,
  Fingerprint as FingerprintIcon,
  Send as SendIcon,
  CallReceived as ReceiveIcon,
  SwapHoriz as SwapIcon,
  MoreVert as MoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useWalletStore, walletSelectors } from '@/store/wallet.store';
import Jazzicon from '@/components/atoms/Jazzicon';
import TokenListItem, { type Token } from '@/components/molecules/TokenListItem';
import NFTCard, { type NFT } from '@/components/molecules/NFTCard';
import WalletSelectorModal from '@/components/organisms/WalletSelectorModal';

// Placeholder token data
const MOCK_TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.4582', price: 3450.00, change24h: 2.34, color: '#627EEA' },
  { symbol: 'WASSIE', name: 'Wassie', balance: '420690', price: 0.000234, change24h: 15.67, color: '#4169E1' },
  { symbol: 'MOG', name: 'Mog Coin', balance: '1500000', price: 0.00000089, change24h: -8.45, color: '#FF6B6B' },
  { symbol: 'PEPE', name: 'Pepe', balance: '25000000', price: 0.0000185, change24h: 5.23, color: '#3CB371' },
  { symbol: 'MON', name: 'Mon Protocol', balance: '5000', price: 0.42, change24h: 12.89, color: '#9B59B6' },
  { symbol: 'GRT', name: 'The Graph', balance: '1250', price: 0.28, change24h: -2.15, color: '#6747ED' },
];

// Placeholder NFT data
const MOCK_NFTS: NFT[] = [
  { id: '1', name: 'Pudgy Penguin #1234', collection: 'Pudgy Penguins', image: 'https://picsum.photos/seed/pudgy1/400/400', floorPrice: 12.5 },
  { id: '2', name: 'Azuki #5678', collection: 'Azuki', image: 'https://picsum.photos/seed/azuki1/400/400', floorPrice: 8.2 },
  { id: '3', name: 'Doodle #9012', collection: 'Doodles', image: 'https://picsum.photos/seed/doodle1/400/400', floorPrice: 3.8 },
  { id: '4', name: 'Milady #3456', collection: 'Milady Maker', image: 'https://picsum.photos/seed/milady1/400/400', floorPrice: 4.5 },
  { id: '5', name: 'Bored Ape #7890', collection: 'BAYC', image: 'https://picsum.photos/seed/bayc1/400/400', floorPrice: 28.0 },
  { id: '6', name: 'Clone X #2345', collection: 'Clone X', image: 'https://picsum.photos/seed/clonex1/400/400', floorPrice: 2.1 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const activeWallet = useWalletStore((state) => state.activeWallet);
  const wallets = useWalletStore((state) => state.wallets);
  const hasWallets = useWalletStore(walletSelectors.hasWallets);
  const isLocked = useWalletStore((state) => state.isLocked);
  const setActiveWallet = useWalletStore((state) => state.setActiveWallet);
  
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Redirect to welcome only if no wallets exist at all
  useEffect(() => {
    if (!hasWallets && !isLocked) {
      navigate('/');
    }
  }, [hasWallets, isLocked, navigate]);

  const handleUnlock = async () => {
    setUnlocking(true);
    setUnlockError(null);

    try {
      const lastCredentialId = localStorage.getItem('skypier_last_credential_id');

      if (!lastCredentialId) {
        setUnlockError('No credential found. Please create a new wallet.');
        return;
      }

      await useWalletStore.getState().unlock(lastCredentialId);
    } catch (error) {
      console.error('Unlock failed:', error);
      setUnlockError(error instanceof Error ? error.message : 'Failed to unlock wallet');
    } finally {
      setUnlocking(false);
    }
  };

  const handleCopyAddress = async () => {
    if (activeWallet) {
      await navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculate total portfolio value
  const totalValue = MOCK_TOKENS.reduce((sum, token) => {
    return sum + parseFloat(token.balance) * token.price;
  }, 0);

  // Locked State
  if (isLocked) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          background: (theme) => 
            `radial-gradient(ellipse at top, ${theme.palette.primary.main}15 0%, transparent 50%)`,
        }}
      >
        <Container maxWidth="xs">
          <Stack spacing={4} alignItems="center">
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => `0 0 60px ${theme.palette.primary.main}50`,
              }}
            >
              <FingerprintIcon sx={{ fontSize: 56, color: 'primary.contrastText' }} />
            </Box>
            
            <Stack spacing={1} alignItems="center">
              <Typography variant="h4" fontWeight={700} textAlign="center">
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Authenticate to unlock your wallet
              </Typography>
            </Stack>

            {unlockError && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {unlockError}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleUnlock}
              disabled={unlocking}
              startIcon={unlocking ? <CircularProgress size={20} color="inherit" /> : <FingerprintIcon />}
              sx={{
                py: 2,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {unlocking ? 'Unlocking...' : 'Unlock with Biometrics'}
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (!activeWallet) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      {/* Header / Profile Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, transparent 100%)`,
          pt: { xs: 4, sm: 6 },
          pb: 4,
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={3} alignItems="center">
            {/* Profile Picture & Wallet Selector */}
            <Box
              onClick={() => setWalletModalOpen(true)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover .wallet-arrow': {
                  transform: 'translateY(2px)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: 3,
                    borderColor: 'primary.main',
                    p: 0.5,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  <Jazzicon address={activeWallet.address} size={68} />
                </Box>
              </Box>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h6" fontWeight={600}>
                  {activeWallet.name || 'Wallet'}
                </Typography>
                <ArrowDownIcon
                  className="wallet-arrow"
                  sx={{
                    fontSize: 20,
                    color: 'text.secondary',
                    transition: 'transform 0.2s',
                  }}
                />
              </Stack>
            </Box>

            {/* Address */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={handleCopyAddress}
              sx={{
                cursor: 'pointer',
                py: 0.75,
                px: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', fontWeight: 500 }}
              >
                {formatAddress(activeWallet.address)}
              </Typography>
              <CopyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Fade in={copied}>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  Copied!
                </Typography>
              </Fade>
            </Stack>

            {/* Total Balance */}
            <Box textAlign="center">
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ${totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Portfolio Value
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              {[
                { icon: <SendIcon />, label: 'Send', color: 'primary' },
                { icon: <ReceiveIcon />, label: 'Receive', color: 'secondary' },
                { icon: <SwapIcon />, label: 'Swap', color: 'info' },
              ].map((action) => (
                <Stack key={action.label} alignItems="center" spacing={1}>
                  <IconButton
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: `${action.color}.main`,
                      color: `${action.color}.contrastText`,
                      '&:hover': {
                        bgcolor: `${action.color}.dark`,
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {action.icon}
                  </IconButton>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {action.label}
                  </Typography>
                </Stack>
              ))}
              <Stack alignItems="center" spacing={1}>
                <IconButton
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <MoreIcon />
                </IconButton>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  More
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Tabs */}
      <Container maxWidth="sm">
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="Tokens" />
          <Tab label="NFTs" />
          <Tab label="Activity" />
        </Tabs>

        {/* Tokens Tab */}
        {activeTab === 0 && (
          <Stack spacing={0.5}>
            {MOCK_TOKENS.map((token) => (
              <TokenListItem key={token.symbol} token={token} onClick={() => {}} />
            ))}
          </Stack>
        )}

        {/* NFTs Tab */}
        {activeTab === 1 && (
          <Grid container spacing={2}>
            {MOCK_NFTS.map((nft) => (
              <Grid size={{ xs: 6, sm: 4 }} key={nft.id}>
                <NFTCard nft={nft} onClick={() => {}} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Activity Tab */}
        {activeTab === 2 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" gutterBottom>
              No Activity Yet
            </Typography>
            <Typography variant="body2">
              Your transactions will appear here
            </Typography>
          </Box>
        )}
      </Container>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallets={wallets}
        activeAddress={activeWallet.address}
        onSelectWallet={setActiveWallet}
      />
    </Box>
  );
}
