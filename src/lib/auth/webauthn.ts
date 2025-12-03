import { WalletError, WalletErrorCode } from '@/types'
import type { WebAuthnCredential } from '@/types'

/**
 * WebAuthn Service for biometric authentication
 * Integrates with hardware security modules (Secure Enclave / StrongBox)
 */
export class WebAuthnService {
  private readonly rpName = 'SkypierWallet'
  private readonly rpId: string

  constructor() {
    // Use the current hostname as RP ID (Relying Party ID)
    this.rpId = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  }

  /**
   * Check if WebAuthn is available in the current environment
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined
    )
  }

  /**
   * Check if the device supports platform authenticators (biometrics)
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch (error) {
      console.error('Error checking platform authenticator:', error)
      return false
    }
  }

  /**
   * Create a new WebAuthn credential for biometric authentication
   * Uses secp256r1 (ES256 / P-256) algorithm
   */
  async createCredential(
    userId: string,
    userName: string
  ): Promise<WebAuthnCredential> {
    if (!this.isAvailable()) {
      throw new WalletError(
        'WebAuthn is not supported in this browser',
        WalletErrorCode.WEBAUTHN_NOT_SUPPORTED
      )
    }

    const available = await this.isPlatformAuthenticatorAvailable()
    if (!available) {
      throw new WalletError(
        'No biometric authenticator available on this device',
        WalletErrorCode.WEBAUTHN_NOT_SUPPORTED
      )
    }

    try {
      // Generate challenge
      const challenge = this.generateChallenge()

      // Create credential options
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge.buffer as ArrayBuffer,
        rp: {
          name: this.rpName,
          id: this.rpId,
        },
        user: {
          id: this.stringToBuffer(userId).buffer as ArrayBuffer,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7, // ES256 (secp256r1 / P-256)
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Require platform authenticator
          userVerification: 'required', // Require biometric verification
          residentKey: 'preferred', // Store credential in authenticator if possible
        },
        timeout: 60000, // 60 seconds
        attestation: 'none', // We don't need attestation for POC
      }

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })

      if (!credential || credential.type !== 'public-key') {
        throw new WalletError(
          'Failed to create credential',
          WalletErrorCode.WEBAUTHN_CREATION_FAILED
        )
      }

      const publicKeyCredential = credential as PublicKeyCredential
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse

      return {
        id: publicKeyCredential.id,
        rawId: new Uint8Array(publicKeyCredential.rawId),
        publicKey: new Uint8Array(response.getPublicKey() || new ArrayBuffer(0)),
      }
    } catch (error) {
      if (error instanceof WalletError) {
        throw error
      }

      // Handle user cancellation
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new WalletError(
          'Biometric authentication was cancelled',
          WalletErrorCode.WEBAUTHN_CANCELLED,
          error
        )
      }

      throw new WalletError(
        'Failed to create WebAuthn credential',
        WalletErrorCode.WEBAUTHN_CREATION_FAILED,
        error
      )
    }
  }

  /**
   * Authenticate using existing WebAuthn credential
   */
  async authenticate(credentialId: string): Promise<{
    success: boolean
    signature?: Uint8Array
    authenticatorData?: Uint8Array
    clientDataJSON?: Uint8Array
  }> {
    if (!this.isAvailable()) {
      throw new WalletError(
        'WebAuthn is not supported',
        WalletErrorCode.WEBAUTHN_NOT_SUPPORTED
      )
    }

    try {
      const challenge = this.generateChallenge()

      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge.buffer as ArrayBuffer,
        allowCredentials: [
          {
            type: 'public-key',
            id: this.base64ToBuffer(credentialId).buffer as ArrayBuffer,
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      }

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })

      if (!credential || credential.type !== 'public-key') {
        return { success: false }
      }

      const publicKeyCredential = credential as PublicKeyCredential
      const response = publicKeyCredential.response as AuthenticatorAssertionResponse

      return {
        success: true,
        signature: new Uint8Array(response.signature),
        authenticatorData: new Uint8Array(response.authenticatorData),
        clientDataJSON: new Uint8Array(response.clientDataJSON),
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new WalletError(
          'Authentication was cancelled',
          WalletErrorCode.WEBAUTHN_CANCELLED,
          error
        )
      }

      throw new WalletError(
        'Authentication failed',
        WalletErrorCode.WEBAUTHN_AUTH_FAILED,
        error
      )
    }
  }

  /**
   * Generate a cryptographic challenge
   */
  private generateChallenge(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32))
  }

  /**
   * Convert string to Uint8Array
   */
  private stringToBuffer(str: string): Uint8Array {
    return new TextEncoder().encode(str)
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  /**
   * Convert Uint8Array to base64 string
   */
  bufferToBase64(buffer: Uint8Array): string {
    let binary = ''
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i])
    }
    return btoa(binary)
  }
}

// Export singleton instance
export const webAuthnService = new WebAuthnService()
