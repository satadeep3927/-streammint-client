// src/services/file.service.ts
import { FileLike, FileObject, FileUpload } from "../types/file.type";
import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";

export class FileService extends BaseService {
  /**
   * Retrieves the list of files uploaded to the project.
   */
  public async getFiles(): Promise<IEnumerable<FileObject>> {
    const { data } = await this.get("/v1/project/uploads");
    return from(data.data);
  }

  /**
   * Uploads files to the project scope.
   * Handles File (browser), Blob, and FileLike (React Native) objects.
   *
   * @param files - Array of FileUpload objects
   * @param extra - Optional additional metadata
   * @returns Promise<FileObject> - The uploaded file object
   */
  public async uploadFile(
    files: FileUpload[],
    extra?: Record<string, any>
  ): Promise<FileObject> {
    const formData = new FormData();
    
    files.forEach((fileUpload, index) => {
      const { file, name } = fileUpload;
      
      // ✅ Handle different file types for React Native compatibility
      if (this.isFileLike(file)) {
        // React Native FileLike object
        const fileName = name || file.name || `file_${index}`;
        
        // ✅ React Native expects this format
        formData.append("files", {
          uri: file.uri,
          type: file.type,
          name: fileName,
        } as any, fileName);
        
      } else if (file instanceof File) {
        // Browser File object
        const fileName = name || file.name || `file_${index}`;
        formData.append("files", file, fileName);
        
      } else if (file instanceof Blob) {
        // Blob object
        const fileName = name || `blob_${index}`;
        formData.append("files", file, fileName);
        
      } else {
        console.warn(`[FileService] Unsupported file type at index ${index}:`, typeof file);
      }
    });

    // ✅ Add extra metadata if provided
    if (extra) {
      formData.append("extra", JSON.stringify(extra));
    }

    // ✅ Don't set Content-Type header - let the browser/RN set it automatically
    // This ensures proper boundary is set for multipart/form-data
    const { data } = await this.post("/v1/project/uploads", formData);
    
    return data.data;
  }

  /**
   * Type guard to check if file is FileLike (React Native)
   */
  private isFileLike(file: any): file is FileLike {
    return (
      file &&
      typeof file === 'object' &&
      typeof file.uri === 'string' &&
      typeof file.type === 'string' &&
      typeof file.name === 'string'
    );
  }

  /**
   * Deletes a file from the project.
   */
  public async deleteFile(fileID: string): Promise<void> {
    await this.delete(`/v1/project/uploads/${fileID}`);
  }

  /**
   * Helper method to create FileLike object for React Native
   * @param uri - Local file URI from React Native
   * @param type - MIME type of the file
   * @param name - File name
   */
  public static createFileLike(uri: string, type: string, name: string): FileLike {
    return { uri, type, name };
  }

  /**
   * Upload a single file (convenience method)
   */
  public async uploadSingleFile(
    file: File | Blob | FileLike,
    name?: string,
    extra?: Record<string, any>
  ): Promise<FileObject> {
    return this.uploadFile([{ file, name }], extra);
  }
}