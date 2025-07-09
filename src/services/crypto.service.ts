/**
 *  CryptoService provides methods for encoding and hashing strings.
 *  It includes methods for Base64 encoding, Base64URL encoding, and SHA-256
 *   hashing.
 *  This service is useful for securely encoding data and generating hashes.
 */
export class CryptoService {
  /**
   * Convert string to array of bytes
   */
  private static stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else if (code < 0x10000) {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  /**
   * Base64 encode
   */
  private static base64Encode(str: string): string {
    if (typeof btoa !== 'undefined') {
      return btoa(str);
    }
    
    // Manual base64 encoding for environments without btoa
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  /**
   * Base64URL encode
   */
  static base64UrlEncode(str: string): string {
    return this.base64Encode(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * SHA-256 hash implementation
   */
  private static sha256(message: string): number[] {
    // SHA-256 constants
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
      0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
      0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
      0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
      0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
      0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // Initial hash values
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

    // Pre-processing
    const msgBytes = this.stringToBytes(message);
    const msgLength = msgBytes.length;
    const bitLength = msgLength * 8;

    // Append '1' bit
    msgBytes.push(0x80);

    // Append zeros
    while ((msgBytes.length % 64) !== 56) {
      msgBytes.push(0);
    }

    // Append length
    for (let i = 7; i >= 0; i--) {
      msgBytes.push((bitLength >>> (i * 8)) & 0xff);
    }

    // Process 512-bit chunks
    for (let chunk = 0; chunk < msgBytes.length; chunk += 64) {
      const w = new Array(64);

      // Copy chunk into first 16 words
      for (let i = 0; i < 16; i++) {
        w[i] = (msgBytes[chunk + i * 4] << 24) |
               (msgBytes[chunk + i * 4 + 1] << 16) |
               (msgBytes[chunk + i * 4 + 2] << 8) |
               msgBytes[chunk + i * 4 + 3];
      }

      // Extend the first 16 words into the remaining 48 words
      for (let i = 16; i < 64; i++) {
        const s0 = this.rightRotate(w[i - 15], 7) ^ this.rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = this.rightRotate(w[i - 2], 17) ^ this.rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xffffffff;
      }

      // Initialize working variables
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

      // Main loop
      for (let i = 0; i < 64; i++) {
        const S1 = this.rightRotate(e, 6) ^ this.rightRotate(e, 11) ^ this.rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + k[i] + w[i]) & 0xffffffff;
        const S0 = this.rightRotate(a, 2) ^ this.rightRotate(a, 13) ^ this.rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) & 0xffffffff;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) & 0xffffffff;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) & 0xffffffff;
      }

      // Add chunk's hash to result
      h0 = (h0 + a) & 0xffffffff;
      h1 = (h1 + b) & 0xffffffff;
      h2 = (h2 + c) & 0xffffffff;
      h3 = (h3 + d) & 0xffffffff;
      h4 = (h4 + e) & 0xffffffff;
      h5 = (h5 + f) & 0xffffffff;
      h6 = (h6 + g) & 0xffffffff;
      h7 = (h7 + h) & 0xffffffff;
    }

    // Convert to bytes
    return [
      (h0 >>> 24) & 0xff, (h0 >>> 16) & 0xff, (h0 >>> 8) & 0xff, h0 & 0xff,
      (h1 >>> 24) & 0xff, (h1 >>> 16) & 0xff, (h1 >>> 8) & 0xff, h1 & 0xff,
      (h2 >>> 24) & 0xff, (h2 >>> 16) & 0xff, (h2 >>> 8) & 0xff, h2 & 0xff,
      (h3 >>> 24) & 0xff, (h3 >>> 16) & 0xff, (h3 >>> 8) & 0xff, h3 & 0xff,
      (h4 >>> 24) & 0xff, (h4 >>> 16) & 0xff, (h4 >>> 8) & 0xff, h4 & 0xff,
      (h5 >>> 24) & 0xff, (h5 >>> 16) & 0xff, (h5 >>> 8) & 0xff, h5 & 0xff,
      (h6 >>> 24) & 0xff, (h6 >>> 16) & 0xff, (h6 >>> 8) & 0xff, h6 & 0xff,
      (h7 >>> 24) & 0xff, (h7 >>> 16) & 0xff, (h7 >>> 8) & 0xff, h7 & 0xff
    ];
  }

  /**
   * Right rotate function for SHA-256
   */
  private static rightRotate(value: number, amount: number): number {
    return ((value >>> amount) | (value << (32 - amount))) >>> 0;
  }

  /**
   * HMAC-SHA256 implementation
   */
  static hmacSha256(key: string, message: string): string {
    const keyBytes = this.stringToBytes(key);
    const blockSize = 64;

    // Keys longer than blockSize are shortened
    let keyBuffer = keyBytes.slice();
    if (keyBuffer.length > blockSize) {
      keyBuffer = this.sha256(key);
    }

    // Keys shorter than blockSize are zero-padded
    while (keyBuffer.length < blockSize) {
      keyBuffer.push(0);
    }

    // Create inner and outer padding
    const innerPadding = keyBuffer.map(b => b ^ 0x36);
    const outerPadding = keyBuffer.map(b => b ^ 0x5c);

    // Perform inner hash
    const innerMessage = String.fromCharCode(...innerPadding) + message;
    const innerHash = this.sha256(innerMessage);

    // Perform outer hash
    const outerMessage = String.fromCharCode(...outerPadding) + String.fromCharCode(...innerHash);
    const finalHash = this.sha256(outerMessage);

    // Convert to base64url
    return this.base64UrlEncode(String.fromCharCode(...finalHash));
  }
}