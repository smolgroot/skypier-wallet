/**
 * Wallet Store
 * 
 * Global state management for wallet data using Zustand.
 * Manages wallet list, active wallet selection, and lock/unlock state.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Wallet, BiometricWallet, ImportedWallet } from '@/types';
import { WalletError, WalletErrorCode } from '@/types';
import {
  storeWallets,
  retrieveWallets,
  storeActiveWallet,
  retrieveActiveWallet,
  storeCredential,
  derivePasswordFromCredential,
  hasStoredWallets,
  clearAllData,
} from '@/lib/storage/encrypted';
import { webAuthnService } from '@/lib/auth/webauthn';

// Session configuration
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_KEY = 'skypier_session';

interface SessionData {
  expiresAt: number;
  credentialId: string;
}

/**
 * Check if there's a valid session
 */
const getValidSession = (): SessionData | null => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session: SessionData = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      // Session expired, clear it
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

/**
 * Create or extend a session
 */
const createSession = (credentialId: string): void => {
  const session: SessionData = {
    expiresAt: Date.now() + SESSION_TIMEOUT_MS,
    credentialId,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Clear the session
 */
const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

interface WalletState {
  // State
  wallets: Wallet[];
  activeWallet: Wallet | null;
  isLocked: boolean;
  isLoading: boolean;
  error: WalletError | null;
  
  // Actions
  addWallet: (wallet: Wallet) => Promise<void>;
  removeWallet: (address: string) => Promise<void>;
  setActiveWallet: (address: string) => void;
  lock: () => void;
  unlock: (credentialId?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
}

// Initial state
const initialState = {
  wallets: [],
  activeWallet: null,
  isLocked: true,
  isLoading: false,
  error: null,
};

/**
 * Wallet Store
 * 
 * Central store for wallet management with encrypted persistence.
 */
export const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Initialize the store by loading wallets from encrypted storage
         * If there's a valid session, auto-unlock the wallet
         */
        initialize: async () => {
          const { isLocked, wallets } = get();
          
          // If already initialized with wallets, don't re-initialize
          if (wallets.length > 0 && !isLocked) {
            return;
          }
          
          set({ isLoading: true, error: null });
          
          try {
            // Check if any wallets exist
            if (!hasStoredWallets()) {
              set({ isLoading: false, isLocked: false });
              return;
            }
            
            // Check for valid session - auto-unlock if session is still valid
            const session = getValidSession();
            if (session) {
              try {
                // Derive password from stored credential (no biometric prompt needed)
                const password = await derivePasswordFromCredential(session.credentialId);
                
                // Retrieve and decrypt wallets
                const decryptedWallets = await retrieveWallets(password);
                
                if (decryptedWallets.length > 0) {
                  // Get active wallet
                  const activeAddress = retrieveActiveWallet();
                  const activeWallet = activeAddress 
                    ? decryptedWallets.find(w => w.address === activeAddress) || decryptedWallets[0]
                    : decryptedWallets[0];
                  
                  // Extend the session
                  createSession(session.credentialId);
                  
                  set({ 
                    wallets: decryptedWallets,
                    activeWallet,
                    isLocked: false,
                    isLoading: false,
                  });
                  return;
                }
              } catch (error) {
                // Session auto-unlock failed, clear session and require auth
                console.error('Session auto-unlock failed:', error);
                clearSession();
              }
            }
            
            // No valid session or auto-unlock failed - require authentication
            if (wallets.length === 0) {
              set({ 
                isLoading: false, 
                isLocked: true,
              });
            } else {
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('Failed to initialize wallet store:', error);
            set({
              isLoading: false,
              error: new WalletError(
                'Failed to initialize wallet store',
                WalletErrorCode.UNKNOWN_ERROR,
                error instanceof Error ? error.message : String(error)
              ),
            });
          }
        },

        /**
         * Add a new wallet to the store
         */
        addWallet: async (wallet: Wallet) => {
          set({ isLoading: true, error: null });
          
          try {
            const { wallets } = get();
            
            // Check if wallet already exists
            if (wallets.some(w => w.address === wallet.address)) {
              throw new Error('WALLET_ALREADY_EXISTS');
            }
            
            // Add wallet to list
            const updatedWallets = [...wallets, wallet];
            
            // For biometric wallets, we need to store the credential and encrypt
            if (wallet.type === 'biometric') {
              const biometricWallet = wallet as BiometricWallet;
              const password = await derivePasswordFromCredential(biometricWallet.credentialId);
              
              // Store credential mapping
              await storeCredential(wallet.address, biometricWallet.credentialId, password);
              
              // Store encrypted wallets
              await storeWallets(updatedWallets, password);
              
              // Store last credential ID for unlocking later
              localStorage.setItem('skypier_last_credential_id', biometricWallet.credentialId);
              
              // Create session for 5-minute auto-unlock
              createSession(biometricWallet.credentialId);
            } else {
              // For imported wallets, we still need a password
              // In a real implementation, this would come from user input
              // For now, we'll use a temporary approach
              throw new Error('IMPORTED_WALLET_NOT_SUPPORTED_YET');
            }
            
            // Update state
            set({ 
              wallets: updatedWallets,
              activeWallet: wallet,
              isLocked: false,
              isLoading: false,
            });
            
            // Store active wallet address
            storeActiveWallet(wallet.address);
          } catch (error) {
            console.error('Failed to add wallet:', error);
            const walletError = new WalletError(
              'Failed to add wallet',
              WalletErrorCode.UNKNOWN_ERROR,
              error instanceof Error ? error.message : String(error)
            );
            set({
              isLoading: false,
              error: walletError,
            });
            throw error;
          }
        },

        /**
         * Remove a wallet from the store
         */
        removeWallet: async (address: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const { wallets, activeWallet } = get();
            
            // Find the wallet to remove
            const walletToRemove = wallets.find(w => w.address === address);
            if (!walletToRemove) {
              throw new Error('WALLET_NOT_FOUND');
            }
            
            // Remove wallet from list
            const updatedWallets = wallets.filter(w => w.address !== address);
            
            // Get password for encryption
            let password: string;
            if (walletToRemove.type === 'biometric') {
              const biometricWallet = walletToRemove as BiometricWallet;
              password = await derivePasswordFromCredential(biometricWallet.credentialId);
            } else {
              throw new Error('IMPORTED_WALLET_NOT_SUPPORTED_YET');
            }
            
            // Store updated wallet list
            await storeWallets(updatedWallets, password);
            
            // If we removed the active wallet, select a new one
            let newActiveWallet = activeWallet;
            if (activeWallet?.address === address) {
              newActiveWallet = updatedWallets.length > 0 ? updatedWallets[0] : null;
              if (newActiveWallet) {
                storeActiveWallet(newActiveWallet.address);
              }
            }
            
            set({ 
              wallets: updatedWallets,
              activeWallet: newActiveWallet,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to remove wallet:', error);
            const walletError = new WalletError(
              'Failed to remove wallet',
              WalletErrorCode.UNKNOWN_ERROR,
              error instanceof Error ? error.message : String(error)
            );
            set({
              isLoading: false,
              error: walletError,
            });
            throw error;
          }
        },

        /**
         * Set the active wallet
         */
        setActiveWallet: (address: string) => {
          const { wallets } = get();
          const wallet = wallets.find(w => w.address === address);
          
          if (!wallet) {
            set({
              error: new WalletError(
                'Wallet not found',
                WalletErrorCode.UNKNOWN_ERROR
              ),
            });
            return;
          }
          
          set({ activeWallet: wallet, error: null });
          storeActiveWallet(address);
        },

        /**
         * Lock the wallet (clear sensitive data from memory)
         */
        lock: () => {
          clearSession();
          set({ 
            isLocked: true,
            wallets: [],
            activeWallet: null,
          });
        },

        /**
         * Unlock the wallet using biometric authentication
         */
        unlock: async (credentialId?: string) => {
          set({ isLoading: true, error: null });
          
          try {
            // If no credential ID provided, try to get it from storage
            // In a real app, we'd need to ask user which wallet they want to unlock
            if (!credentialId) {
              throw new Error('CREDENTIAL_ID_REQUIRED');
            }
            
            // Authenticate with biometrics
            await webAuthnService.authenticate(credentialId);
            
            // Derive password from credential
            const password = await derivePasswordFromCredential(credentialId);
            
            // Retrieve and decrypt wallets
            const decryptedWallets = await retrieveWallets(password);
            
            if (decryptedWallets.length === 0) {
              throw new Error('NO_WALLETS_FOUND');
            }
            
            // Get active wallet
            const activeAddress = retrieveActiveWallet();
            const activeWallet = activeAddress 
              ? decryptedWallets.find(w => w.address === activeAddress) || decryptedWallets[0]
              : decryptedWallets[0];
            
            // Create session for 5-minute auto-unlock on refresh
            createSession(credentialId);
            
            set({ 
              wallets: decryptedWallets,
              activeWallet,
              isLocked: false,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to unlock wallet:', error);
            const walletError = new WalletError(
              'Failed to unlock wallet',
              WalletErrorCode.WEBAUTHN_AUTH_FAILED,
              error instanceof Error ? error.message : String(error)
            );
            set({
              isLoading: false,
              isLocked: true,
              error: walletError,
            });
            throw error;
          }
        },

        /**
         * Clear any error state
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Reset the store to initial state (for testing/logout)
         */
        reset: () => {
          clearAllData();
          set(initialState);
        },
      }),
      {
        name: 'wallet-storage',
        // Only persist non-sensitive data
        partialize: (state) => ({
          isLocked: state.isLocked,
        }),
      }
    ),
    {
      name: 'WalletStore',
    }
  )
);

/**
 * Selectors for common state queries
 */
export const walletSelectors = {
  isUnlocked: (state: WalletState) => !state.isLocked,
  hasWallets: (state: WalletState) => state.wallets.length > 0,
  getWalletByAddress: (state: WalletState, address: string) => 
    state.wallets.find(w => w.address === address),
  biometricWallets: (state: WalletState) => 
    state.wallets.filter(w => w.type === 'biometric') as BiometricWallet[],
  importedWallets: (state: WalletState) => 
    state.wallets.filter(w => w.type === 'imported') as ImportedWallet[],
};
