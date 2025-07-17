import CryptoJS from "crypto-js";

/**
 * CryptoService provides methods for encoding and hashing strings using crypto-js.
 * This implementation works across Browser, Node.js, and React Native environments.
 * It includes methods for Base64URL encoding and HMAC-SHA256 hashing.
 * This service provides secure and standard-compliant cryptographic operations.
 */
export class CryptoService {
  /**
   * Base64URL encode a string
   * Converts a string to base64url format (URL-safe base64 without padding)
   */
  static base64UrlEncode(str: string): string {
    // Use crypto-js to encode to base64, then convert to base64url
    const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
    return base64
      .replace(/=/g, "") // Remove padding
      .replace(/\+/g, "-") // Replace + with -
      .replace(/\//g, "_"); // Replace / with _
  }

  /**
   * HMAC-SHA256 implementation using crypto-js
   * Returns a base64url encoded signature
   */
  static hmacSha256(key: string, message: string): string {
    // Generate HMAC-SHA256 hash
    const hash = CryptoJS.HmacSHA256(message, key);

    // Convert to base64
    const base64 = CryptoJS.enc.Base64.stringify(hash);

    // Convert to base64url format
    return base64
      .replace(/=/g, "") // Remove padding
      .replace(/\+/g, "-") // Replace + with -
      .replace(/\//g, "_"); // Replace / with _
  }

  /**
   * SHA-256 hash implementation using crypto-js
   * Returns a base64url encoded hash
   */
  static sha256(message: string): string {
    const hash = CryptoJS.SHA256(message);
    const base64 = CryptoJS.enc.Base64.stringify(hash);

    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  /**
   * Base64URL decode (utility method)
   */
  static base64UrlDecode(base64url: string): string {
    // Convert base64url back to regular base64
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    // Decode using crypto-js
    const words = CryptoJS.enc.Base64.parse(base64);
    return CryptoJS.enc.Utf8.stringify(words);
  }

  /**
   * Generate a random string (useful for nonces, salts, etc.)
   */
  static randomString(length: number = 32): string {
    const randomWords = CryptoJS.lib.WordArray.random(length / 2);
    return CryptoJS.enc.Hex.stringify(randomWords);
  }

  /**
   * Verify HMAC-SHA256 signature
   */
  static verifyHmacSha256(
    key: string,
    message: string,
    signature: string
  ): boolean {
    const expectedSignature = this.hmacSha256(key, message);
    return expectedSignature === signature;
  }
}
