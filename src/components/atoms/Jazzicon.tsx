/**
 * Jazzicon Component
 * 
 * Generates a unique identicon based on an Ethereum address.
 */

import { useEffect, useRef } from 'react';
import jazzicon from '@metamask/jazzicon';
import { Box, type SxProps, type Theme } from '@mui/material';

interface JazziconProps {
  address: string;
  size?: number;
  sx?: SxProps<Theme>;
}

export default function Jazzicon({ address, size = 40, sx }: JazziconProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && address) {
      // Clear previous icon
      containerRef.current.innerHTML = '';
      
      // Generate seed from address
      const seed = parseInt(address.slice(2, 10), 16);
      
      // Create jazzicon element
      const icon = jazzicon(size, seed);
      
      containerRef.current.appendChild(icon);
    }
  }, [address, size]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& > div': {
          borderRadius: '50%',
        },
        ...sx,
      }}
    />
  );
}
