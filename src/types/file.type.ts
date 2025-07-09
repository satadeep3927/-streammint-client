export interface FileObject {
  id: string;
  name: string;
  url: string;
  size: number;
  content_type: string;
  created_at: string;
  extra: Record<string, any> | null;
}

export interface FileUpload {
  file: File | Blob | FileLike;
  name?: string;
}

export interface FileLike {
  name: string;
  type: string;
  uri: string;
}
