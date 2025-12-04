/**
 * Network Hook
 * 
 * React hook for managing network selection and state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  networks, 
  DEFAULT_NETWORK_ID, 
  getNetwork,
  getAllNetworks,
  type NetworkConfig 
} from '../lib/blockchain/networks';
import { clearClientCache } from '../lib/blockchain/provider';

/**
 * Network store state
 */
interface NetworkState {
  /** Currently selected network ID */
  selectedNetworkId: string;
  
  /** Set the selected network */
  setNetwork: (networkId: string) => void;
  
  /** Get the current network config */
  getCurrentNetwork: () => NetworkConfig | undefined;
  
  /** Get all available networks */
  getNetworks: () => NetworkConfig[];
}

/**
 * Zustand store for network selection
 * Persisted to localStorage
 */
export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      selectedNetworkId: DEFAULT_NETWORK_ID,

      setNetwork: (networkId: string) => {
        // Validate network exists
        if (!networks[networkId]) {
          console.warn(`Unknown network: ${networkId}`);
          return;
        }

        // Clear client cache when switching networks
        clearClientCache();

        set({ selectedNetworkId: networkId });
      },

      getCurrentNetwork: () => {
        return getNetwork(get().selectedNetworkId);
      },

      getNetworks: () => {
        return getAllNetworks();
      },
    }),
    {
      name: 'skypier-network',
      partialize: (state) => ({
        selectedNetworkId: state.selectedNetworkId,
      }),
    }
  )
);

/**
 * Hook to get current network
 */
export function useCurrentNetwork(): NetworkConfig | undefined {
  const selectedNetworkId = useNetworkStore((state) => state.selectedNetworkId);
  return networks[selectedNetworkId];
}

/**
 * Hook to get network selection actions
 */
export function useNetworkActions() {
  const setNetwork = useNetworkStore((state) => state.setNetwork);
  const allNetworks = getAllNetworks();

  return {
    setNetwork,
    allNetworks,
  };
}
