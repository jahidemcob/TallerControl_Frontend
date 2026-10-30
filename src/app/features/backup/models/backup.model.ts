export interface BackupFile {
  fileName: string;
  sizeInBytes: number;
  createdAt: string;
}

export interface CreateBackupResponse {
  message: string;
  data: BackupFile;
}

export interface BackupMessageResponse {
  message: string;
}
