/**
 * Wallet Store Tests
 * 
 * Tests for Zustand wallet state management and session handling.
 * Covers US-001, US-003, US-004, US-006
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock the encrypted storage module
vi.mock('@/lib/storage/encrypted', () => ({
  storeWallets: vi.fn().mockResolvedValue(undefined),
  retrieveWallets: vi.fn().mockResolvedValue([]),
  storeActiveWallet: vi.fn(),
  retrieveActiveWallet: vi.fn().mockReturnValue(null),
  storeCredential: vi.fn().mockResolvedValue(undefined),
  derivePasswordFromCredential: vi.fn().mockResolvedValue('mock-password'),
  hasStoredWallets: vi.fn().mockReturnValue(false),
  clearAllData: vi.fn(),
}));

// Mock WebAuthn service
vi.mock('@/lib/auth/webauthn', () => ({
  webAuthnService: {
    authenticate: vi.fn().mockResolvedValue({
      id: 'test-credential-id',
      publicKey: new Uint8Array(65),
      rawId: new Uint8Array(32),
    }),
    createCredential: vi.fn().mockResolvedValue({
      id: 'test-credential-id',
      publicKey: new Uint8Array(65),
      rawId: new Uint8Array(32),
    }),
    isAvailable: vi.fn().mockReturnValue(true),
    isPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
  },
}));

// Import after mocks are set up
import { useWalletStore, walletSelectors } from '@/store/wallet.store';
import { hasStoredWallets, retrieveWallets } from '@/lib/storage/encrypted';
import type { BiometricWallet } from '@/types';

describe('Wallet Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWalletStore.setState({
      wallets: [],
      activeWallet: null,
      isLocked: true,
      isLoading: false,
      error: null,
    });
    
    // Clear localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useWalletStore.getState();

      expect(state.wallets).toEqual([]);
      expect(state.activeWallet).toBeNull();
      expect(state.isLocked).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('addWallet', () => {
    const mockWallet: BiometricWallet = {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
      type: 'biometric',
      name: 'Test Wallet',
      createdAt: Date.now(),
      credentialId: 'test-credential-id',
      publicKey: '0x04abcd1234',
    };

    it('should add a new wallet', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      const state = useWalletStore.getState();
      expect(state.wallets).toHaveLength(1);
      expect(state.wallets[0].address).toBe(mockWallet.address);
    });

    it('should set new wallet as active', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      const state = useWalletStore.getState();
      expect(state.activeWallet?.address).toBe(mockWallet.address);
    });

    it('should unlock after adding wallet', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      const state = useWalletStore.getState();
      expect(state.isLocked).toBe(false);
    });

    it('should store credential ID in localStorage', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'skypier_last_credential_id',
        mockWallet.credentialId
      );
    });

    it('should create session after adding wallet', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'skypier_session',
        expect.stringContaining('expiresAt')
      );
    });

    it('should throw error for duplicate wallet', async () => {
      await act(async () => {
        await useWalletStore.getState().addWallet(mockWallet);
      });

      await expect(
        useWalletStore.getState().addWallet(mockWallet)
      ).rejects.toThrow();
    });
  });

  describe('setActiveWallet', () => {
    const wallet1: BiometricWallet = {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
      type: 'biometric',
      name: 'Wallet 1',
      createdAt: Date.now(),
      credentialId: 'cred-1',
      publicKey: '0x04abcd1234',
    };

    const wallet2: BiometricWallet = {
      address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      type: 'biometric',
      name: 'Wallet 2',
      createdAt: Date.now(),
      credentialId: 'cred-2',
      publicKey: '0x04efgh5678',
    };

    beforeEach(async () => {
      // Add wallets to state directly for testing
      useWalletStore.setState({
        wallets: [wallet1, wallet2],
        activeWallet: wallet1,
        isLocked: false,
      });
    });

    it('should switch active wallet', () => {
      act(() => {
        useWalletStore.getState().setActiveWallet(wallet2.address);
      });

      const state = useWalletStore.getState();
      expect(state.activeWallet?.address).toBe(wallet2.address);
    });

    it('should set error for non-existent wallet', () => {
      act(() => {
        useWalletStore.getState().setActiveWallet('0xNonExistent');
      });

      const state = useWalletStore.getState();
      expect(state.error).not.toBeNull();
    });
  });

  describe('lock', () => {
    it('should lock the wallet and clear data', async () => {
      // Setup unlocked state
      useWalletStore.setState({
        wallets: [{
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
          type: 'biometric',
          name: 'Test',
          createdAt: Date.now(),
          credentialId: 'test-cred',
          publicKey: '0x04test',
        }],
        activeWallet: null,
        isLocked: false,
      });

      act(() => {
        useWalletStore.getState().lock();
      });

      const state = useWalletStore.getState();
      expect(state.isLocked).toBe(true);
      expect(state.wallets).toEqual([]);
      expect(state.activeWallet).toBeNull();
    });

    it('should clear session on lock', () => {
      act(() => {
        useWalletStore.getState().lock();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('skypier_session');
    });
  });

  describe('unlock', () => {
    const mockWallet: BiometricWallet = {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
      type: 'biometric',
      name: 'Test Wallet',
      createdAt: Date.now(),
      credentialId: 'test-credential-id',
      publicKey: '0x04abcd1234',
    };

    beforeEach(() => {
      vi.mocked(retrieveWallets).mockResolvedValue([mockWallet]);
    });

    it('should unlock with valid credential', async () => {
      await act(async () => {
        await useWalletStore.getState().unlock('test-credential-id');
      });

      const state = useWalletStore.getState();
      expect(state.isLocked).toBe(false);
      expect(state.wallets).toHaveLength(1);
    });

    it('should set active wallet after unlock', async () => {
      await act(async () => {
        await useWalletStore.getState().unlock('test-credential-id');
      });

      const state = useWalletStore.getState();
      expect(state.activeWallet).not.toBeNull();
    });

    it('should create session after unlock', async () => {
      await act(async () => {
        await useWalletStore.getState().unlock('test-credential-id');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'skypier_session',
        expect.stringContaining('expiresAt')
      );
    });

    it('should throw error without credential ID', async () => {
      await expect(
        useWalletStore.getState().unlock()
      ).rejects.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should create session with 5-minute expiry', async () => {
      const mockWallet: BiometricWallet = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
        type: 'biometric',
        name: 'Test',
        createdAt: Date.now(),
        credentialId: 'test-cred',
        publicKey: '0x04test',
      };

      vi.mocked(retrieveWallets).mockResolvedValue([mockWallet]);

      await act(async () => {
        await useWalletStore.getState().unlock('test-cred');
      });

      const sessionCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'skypier_session'
      );

      expect(sessionCall).toBeDefined();
      const session = JSON.parse(sessionCall![1]);
      
      // Session should expire in ~5 minutes (with some tolerance)
      const expectedExpiry = Date.now() + 5 * 60 * 1000;
      expect(session.expiresAt).toBeGreaterThan(Date.now());
      expect(session.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should store credential ID in session', async () => {
      const credentialId = 'test-credential-123';
      const mockWallet: BiometricWallet = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
        type: 'biometric',
        name: 'Test',
        createdAt: Date.now(),
        credentialId,
        publicKey: '0x04test',
      };

      vi.mocked(retrieveWallets).mockResolvedValue([mockWallet]);

      await act(async () => {
        await useWalletStore.getState().unlock(credentialId);
      });

      const sessionCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'skypier_session'
      );

      const session = JSON.parse(sessionCall![1]);
      expect(session.credentialId).toBe(credentialId);
    });
  });

  describe('initialize', () => {
    it('should not require auth if no wallets stored', async () => {
      vi.mocked(hasStoredWallets).mockReturnValue(false);

      await act(async () => {
        await useWalletStore.getState().initialize();
      });

      const state = useWalletStore.getState();
      expect(state.isLocked).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should require auth if wallets exist but no session', async () => {
      vi.mocked(hasStoredWallets).mockReturnValue(true);
      localStorageMock.getItem.mockReturnValue(null); // No session

      await act(async () => {
        await useWalletStore.getState().initialize();
      });

      const state = useWalletStore.getState();
      expect(state.isLocked).toBe(true);
    });
  });

  describe('Selectors', () => {
    it('isUnlocked should return opposite of isLocked', () => {
      useWalletStore.setState({ isLocked: false });
      expect(walletSelectors.isUnlocked(useWalletStore.getState())).toBe(true);

      useWalletStore.setState({ isLocked: true });
      expect(walletSelectors.isUnlocked(useWalletStore.getState())).toBe(false);
    });

    it('hasWallets should return true when wallets exist', () => {
      useWalletStore.setState({ wallets: [] });
      expect(walletSelectors.hasWallets(useWalletStore.getState())).toBe(false);

      useWalletStore.setState({
        wallets: [{
          address: '0x123',
          type: 'biometric',
          createdAt: Date.now(),
        }],
      });
      expect(walletSelectors.hasWallets(useWalletStore.getState())).toBe(true);
    });

    it('getWalletByAddress should find wallet', () => {
      const wallet = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fBd7',
        type: 'biometric' as const,
        createdAt: Date.now(),
      };
      useWalletStore.setState({ wallets: [wallet] });

      const found = walletSelectors.getWalletByAddress(
        useWalletStore.getState(),
        wallet.address
      );
      expect(found?.address).toBe(wallet.address);
    });

    it('biometricWallets should filter by type', () => {
      useWalletStore.setState({
        wallets: [
          { address: '0x1', type: 'biometric', createdAt: Date.now(), credentialId: 'a', publicKey: 'x' },
          { address: '0x2', type: 'imported', createdAt: Date.now() },
          { address: '0x3', type: 'biometric', createdAt: Date.now(), credentialId: 'b', publicKey: 'y' },
        ],
      });

      const biometric = walletSelectors.biometricWallets(useWalletStore.getState());
      expect(biometric).toHaveLength(2);
      expect(biometric.every(w => w.type === 'biometric')).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useWalletStore.setState({
        wallets: [{ address: '0x123', type: 'biometric', createdAt: Date.now() }],
        activeWallet: { address: '0x123', type: 'biometric', createdAt: Date.now() },
        isLocked: false,
        isLoading: true,
      });

      act(() => {
        useWalletStore.getState().reset();
      });

      const state = useWalletStore.getState();
      expect(state.wallets).toEqual([]);
      expect(state.activeWallet).toBeNull();
      expect(state.isLocked).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });
});
