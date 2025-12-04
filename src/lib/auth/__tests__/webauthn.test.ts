/**
 * WebAuthn Service Tests
 * 
 * Tests for WebAuthn API integration and biometric authentication.
 * Covers US-001, US-003: Biometric wallet creation and authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { webAuthnService } from '../webauthn';

// Mock navigator.credentials
const mockCredentials = {
  create: vi.fn(),
  get: vi.fn(),
  preventSilentAccess: vi.fn(),
  store: vi.fn(),
};

// Mock PublicKeyCredential
const mockPublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
};

describe('WebAuthn Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup navigator.credentials mock
    Object.defineProperty(globalThis.navigator, 'credentials', {
      value: mockCredentials,
      writable: true,
      configurable: true,
    });

    // Setup PublicKeyCredential mock
    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      value: mockPublicKeyCredential,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when WebAuthn is supported', () => {
      expect(webAuthnService.isAvailable()).toBe(true);
    });

    it('should return false when navigator.credentials is undefined', () => {
      Object.defineProperty(globalThis.navigator, 'credentials', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(webAuthnService.isAvailable()).toBe(false);
    });

    it('should return false when PublicKeyCredential is undefined', () => {
      Object.defineProperty(globalThis, 'PublicKeyCredential', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(webAuthnService.isAvailable()).toBe(false);
    });
  });

  describe('isPlatformAuthenticatorAvailable', () => {
    it('should return true when platform authenticator is available', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);
      
      const result = await webAuthnService.isPlatformAuthenticatorAvailable();
      
      expect(result).toBe(true);
      expect(mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled();
    });

    it('should return false when platform authenticator is not available', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(false);
      
      const result = await webAuthnService.isPlatformAuthenticatorAvailable();
      
      expect(result).toBe(false);
    });

    it('should return false when check throws an error', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(
        new Error('Not supported')
      );
      
      const result = await webAuthnService.isPlatformAuthenticatorAvailable();
      
      expect(result).toBe(false);
    });
  });

  describe('createCredential', () => {
    const mockCredentialResult = {
      id: 'test-credential-id',
      rawId: new Uint8Array([1, 2, 3, 4]),
      response: {
        clientDataJSON: new ArrayBuffer(8),
        attestationObject: new ArrayBuffer(8),
        getPublicKey: () => new ArrayBuffer(65),
      },
      type: 'public-key',
    };

    const userId = 'test-user-id';
    const userName = 'Test Wallet';

    it('should create credential with correct options', async () => {
      mockCredentials.create.mockResolvedValue(mockCredentialResult);
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);

      const result = await webAuthnService.createCredential(userId, userName);

      expect(mockCredentials.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: expect.objectContaining({
            rp: expect.objectContaining({
              name: 'SkypierWallet',
            }),
            user: expect.objectContaining({
              name: userName,
              displayName: userName,
            }),
            pubKeyCredParams: expect.arrayContaining([
              expect.objectContaining({
                type: 'public-key',
                alg: -7, // ES256 (secp256r1)
              }),
            ]),
            authenticatorSelection: expect.objectContaining({
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            }),
          }),
        })
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('test-credential-id');
    });

    it('should return credential ID and public key', async () => {
      const publicKeyBuffer = new ArrayBuffer(65);
      const publicKeyView = new Uint8Array(publicKeyBuffer);
      publicKeyView[0] = 0x04; // Uncompressed public key prefix
      
      mockCredentialResult.response.getPublicKey = () => publicKeyBuffer;
      mockCredentials.create.mockResolvedValue(mockCredentialResult);
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);

      const result = await webAuthnService.createCredential(userId, userName);

      expect(result.id).toBeDefined();
      expect(result.publicKey).toBeDefined();
      expect(result.rawId).toBeDefined();
    });

    it('should throw error when user cancels', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);
      const cancelError = new DOMException('User cancelled', 'NotAllowedError');
      mockCredentials.create.mockRejectedValue(cancelError);

      await expect(webAuthnService.createCredential(userId, userName)).rejects.toThrow();
    });

    it('should throw error when credential is null', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true);
      mockCredentials.create.mockResolvedValue(null);

      await expect(webAuthnService.createCredential(userId, userName)).rejects.toThrow();
    });
  });

  describe('authenticate', () => {
    // Base64-encoded credential ID (valid base64 string)
    const credentialId = 'dGVzdC1jcmVkZW50aWFsLWlk'; // 'test-credential-id' in base64
    
    const createMockAssertion = () => ({
      id: credentialId,
      rawId: new Uint8Array([1, 2, 3, 4]),
      response: {
        clientDataJSON: new ArrayBuffer(8),
        authenticatorData: new ArrayBuffer(37),
        signature: new ArrayBuffer(64),
        userHandle: new ArrayBuffer(8),
      },
      type: 'public-key',
      getClientExtensionResults: () => ({}),
      authenticatorAttachment: 'platform',
    });

    it('should authenticate with stored credential', async () => {
      mockCredentials.get.mockResolvedValue(createMockAssertion());

      const result = await webAuthnService.authenticate(credentialId);
      
      expect(result.success).toBe(true);
      expect(result.signature).toBeDefined();
      expect(result.authenticatorData).toBeDefined();
      expect(mockCredentials.get).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey: expect.objectContaining({
            allowCredentials: expect.arrayContaining([
              expect.objectContaining({
                type: 'public-key',
              }),
            ]),
            userVerification: 'required',
          }),
        })
      );
    });

    it('should throw on user cancellation', async () => {
      const cancelError = new DOMException('User cancelled', 'NotAllowedError');
      mockCredentials.get.mockRejectedValue(cancelError);

      await expect(webAuthnService.authenticate(credentialId)).rejects.toThrow();
    });

    it('should return success false for null credential', async () => {
      mockCredentials.get.mockResolvedValue(null);

      const result = await webAuthnService.authenticate(credentialId);
      expect(result.success).toBe(false);
    });

    it('should handle biometric failure', async () => {
      const authError = new DOMException('Biometric verification failed', 'NotAllowedError');
      mockCredentials.get.mockRejectedValue(authError);

      await expect(webAuthnService.authenticate(credentialId)).rejects.toThrow();
    });
  });
});
