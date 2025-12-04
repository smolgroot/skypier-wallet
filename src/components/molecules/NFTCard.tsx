/**
 * NFT Card Component
 * 
 * Displays an NFT with image, name, and collection info.
 */

import { Box, Typography, Skeleton } from '@mui/material';
import { useState } from 'react';

export interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPrice?: number;
}

interface NFTCardProps {
  nft: NFT;
  onClick?: () => void;
}

export default function NFTCard({ nft, onClick }: NFTCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}20`,
        } : {},
      }}
    >
      {/* NFT Image */}
      <Box
        sx={{
          position: 'relative',
          paddingTop: '100%', // 1:1 aspect ratio
          bgcolor: 'action.hover',
        }}
      >
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {!imageError ? (
          <Box
            component="img"
            src={nft.image}
            alt={nft.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.selected',
            }}
          >
            <Typography variant="h4" sx={{ opacity: 0.5 }}>
              🖼️
            </Typography>
          </Box>
        )}
      </Box>

      {/* NFT Info */}
      <Box sx={{ p: 1.5 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          noWrap
          sx={{ display: 'block', mb: 0.25 }}
        >
          {nft.collection}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {nft.name}
        </Typography>
        {nft.floorPrice !== undefined && (
          <Typography 
            variant="caption" 
            color="primary.main"
            sx={{ fontWeight: 500, mt: 0.5, display: 'block' }}
          >
            Floor: {nft.floorPrice} ETH
          </Typography>
        )}
      </Box>
    </Box>
  );
}
