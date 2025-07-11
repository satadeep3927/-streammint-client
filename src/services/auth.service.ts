import BaseService from "./service";

/**
 * Authentication service for organization management
 */
export interface OrganizationData {
  name: string;
  email: string;
  password: string;
  extra?: Record<string, any>;
  username?: string; // Optional username for registration
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: boolean;
  data: any;
  token?: string;
}

export interface RegisterResponse {
  status: boolean;
  data: OrganizationData & {
    id: string;
  };
}

export class AuthService extends BaseService {
  constructor(baseURL: string) {
    // Auth service doesn't need secret credentials for registration/login
    super(baseURL, "", "");
  }

  /**
   * Register a new organization
   * @param data - Organization registration data
   * @returns Promise resolving to the created organization
   */
  public async registerOrganization(
    data: OrganizationData
  ): Promise<RegisterResponse> {
    const response = await this.post("/v1/auth/register", data);
    return response.data;
  }

  /**
   * Login an organization
   * @param data - Login credentials
   * @returns Promise resolving to login response with token
   */
  public async loginOrganization(data: LoginData): Promise<AuthResponse> {
    const response = await this.post("/v1/auth/login", data);
    return response.data;
  }

  /**
   * Get organization profile (requires authentication)
   * @param token - JWT token
   * @returns Promise resolving to organization profile
   */
  public async getProfile(token: string): Promise<any> {
    // Temporarily set authorization header
    this.client.defaults.headers.Authorization = `Bearer ${token}`;

    try {
      const response = await this.get("/v1/auth/me");
      return response.data;
    } finally {
      // Remove authorization header
      delete this.client.defaults.headers.Authorization;
    }
  }
}
