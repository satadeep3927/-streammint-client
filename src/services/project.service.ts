import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";

/**
 * Project data interface
 */
export interface ProjectData {
  name: string;
  description?: string;
  extra?: Record<string, any>;
}

/**
 * Token data interface
 */
export interface TokenData {
  name: string;
  extra?: Record<string, any>;
  expires_at: null | string; // ISO date string or null for no expiry
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_at: string;
  extra?: Record<string, any>;
}

/**
 * Token interface
 */
export interface ProjectToken {
  id: string;
  name: string;
  secret_id: string;
  secret_key: string;
  project_id: string;
  created_at: string;
  extra?: Record<string, any>;
}

/**
 * Service for managing projects (requires organization authentication)
 */
export class ProjectService extends BaseService {
  constructor(baseURL: string, authToken: string) {
    super(baseURL, "", "");
    // Set the authorization header for all requests
    this.client.defaults.headers.Authorization = `Bearer ${authToken}`;
  }

  /**
   * Create a new project
   * @param data - Project data
   * @returns Promise resolving to the created project
   */
  public async createProject(data: ProjectData): Promise<Project> {
    const response = await this.post("/v1/project", data);
    return response.data.data;
  }

  /**
   * Get all projects for the organization
   * @returns Promise resolving to array of projects
   */
  public async getProjects(): Promise<IEnumerable<Project>> {
    const response = await this.get("/v1/project");
    return from(response.data.data);
  }

  /**
   * Get a specific project by ID
   * @param projectId - Project ID
   * @returns Promise resolving to the project
   */
  public async getProject(projectId: string): Promise<Project> {
    const response = await this.get(`/v1/project/${projectId}`);
    return response.data.data;
  }

  /**
   * Update a project
   * @param projectId - Project ID
   * @param data - Updated project data
   * @returns Promise resolving to the updated project
   */
  public async updateProject(
    projectId: string,
    data: Partial<ProjectData>
  ): Promise<Project> {
    const response = await this.put(`/v1/project/${projectId}`, data);
    return response.data.data;
  }

  /**
   * Delete a project
   * @param projectId - Project ID
   * @returns Promise resolving when project is deleted
   */
  public async deleteProject(projectId: string): Promise<void> {
    await this.delete(`/v1/project/${projectId}`);
  }

  /**
   * Create a new token for a project
   * @param projectId - Project ID
   * @param data - Token data
   * @returns Promise resolving to the created token
   */
  public async createToken(
    projectId: string,
    data: TokenData
  ): Promise<ProjectToken> {
    const response = await this.post(`/v1/project/${projectId}/tokens`, data);
    return response.data.data;
  }

  /**
   * Get all tokens for a project
   * @param projectId - Project ID
   * @returns Promise resolving to array of tokens
   */
  public async getTokens(
    projectId: string
  ): Promise<IEnumerable<ProjectToken>> {
    const response = await this.get(`/v1/project/${projectId}/tokens`);
    return from(response.data.data);
  }

  /**
   * Delete a token
   * @param projectId - Project ID
   * @param tokenId - Token ID
   * @returns Promise resolving when token is deleted
   */
  public async deleteToken(projectId: string, tokenId: string): Promise<void> {
    await this.delete(`/v1/project/${projectId}/tokens/${tokenId}`);
  }
}
