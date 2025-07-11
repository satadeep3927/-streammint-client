import axios, { AxiosInstance } from "axios";

import { CryptoService } from "./crypto.service";

export default class BaseService {
  /**
   *  Base URL for the service
   *  @protected
   *  @type {string}
   */
  protected client: AxiosInstance;

  constructor(
    protected baseURL: string,
    protected secretID: string,
    protected secretkey: string
  ) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add a request interceptor to include the JWT token in the headers
    this.client.interceptors.request.use(
      async (config) => {
        if (!config.headers.Authorization) {
          const token = this.generateToken(this.secretID, this.secretkey);
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Generates a JWT token using Web Crypto API
   * @param sub - Subject identifier
   * @param jwtSecret - Secret key for signing
   * @param expiry - Token expiry in seconds (default: 30)
   * @returns Promise<string> - The signed JWT token
   */
  protected generateToken(
    secretID: string,
    secretKey: string,
    expiry: number = 30
  ): string {
    // JWT header
    const header = {
      typ: "JWT",
      alg: "HS256",
    };

    // JWT payload
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const payload = {
      sub: secretID,
      iat: currentTimestamp,
      exp: currentTimestamp + expiry,
      jti: "jwt_nonce",
    };

    // Encode header and payload
    const encodedHeader = CryptoService.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = CryptoService.base64UrlEncode(
      JSON.stringify(payload)
    );

    // Create the token string to sign
    const tokenString = `${encodedHeader}.${encodedPayload}`;

    // Sign the token
    const signature = CryptoService.hmacSha256(secretKey, tokenString);

    // Encode the signature
    const encodedSignature = CryptoService.base64UrlEncode(signature);

    // Return the complete JWT
    return `${tokenString}.${encodedSignature}`;
  }
  /**
   * HTTP GET request
   * @returns The bound get method of the Axios instance
   */
  protected get get() {
    return this.client.get.bind(this.client);
  }
  /**
   * HTTP POST request
   * @returns  The bound post method of the Axios instance
   */
  protected get post() {
    return this.client.post.bind(this.client);
  }
  /**
   * HTTP PUT request
   * @returns The bound put method of the Axios instance
   */
  protected get put() {
    return this.client.put.bind(this.client);
  }
  /**
   * HTTP DELETE request
   * @returns The bound delete method of the Axios instance
   */
  protected get delete() {
    return this.client.delete.bind(this.client);
  }
}
