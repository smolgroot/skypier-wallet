/**
 * Token List Item Component
 * 
 * Displays a single token with icon, name, balance, and price.
 */

import { Box, Stack, Typography, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  change24h: number;
  icon?: string;
  color?: string;
}

interface TokenListItemProps {
  token: Token;
  onClick?: () => void;
}

export default function TokenListItem({ token, onClick }: TokenListItemProps) {
  const value = parseFloat(token.balance) * token.price;
  const isPositive = token.change24h >= 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 2,
        transition: 'background-color 0.2s',
        '&:hover': onClick ? {
          bgcolor: 'action.hover',
        } : {},
        '&:active': onClick ? {
          bgcolor: 'action.selected',
        } : {},
      }}
    >
      {/* Token Icon */}
      <Avatar
        src={token.icon}
        sx={{
          width: 44,
          height: 44,
          bgcolor: token.color || 'primary.main',
          fontSize: '1rem',
          fontWeight: 700,
        }}
      >
        {token.symbol.slice(0, 2)}
      </Avatar>

      {/* Token Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={600} noWrap>
          {token.name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {parseFloat(token.balance).toLocaleString(undefined, { 
              maximumFractionDigits: 4 
            })} {token.symbol}
          </Typography>
        </Stack>
      </Box>

      {/* Value & Change */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body1" fontWeight={600}>
          ${value.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </Typography>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.25} 
          justifyContent="flex-end"
        >
          {isPositive ? (
            <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
          ) : (
            <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              color: isPositive ? 'success.main' : 'error.main',
              fontWeight: 500,
            }}
          >
            {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
