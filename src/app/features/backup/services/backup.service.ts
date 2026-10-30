import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BackupFile,
  BackupMessageResponse,
  CreateBackupResponse,
} from '../models/backup.model';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/backup`;

  getBackups(): Observable<BackupFile[]> {
    return this.http.get<BackupFile[]>(this.apiUrl);
  }

  createBackup(): Observable<CreateBackupResponse> {
    return this.http.post<CreateBackupResponse>(this.apiUrl, {});
  }

  downloadBackup(fileName: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/download/${encodeURIComponent(fileName)}`,
      { responseType: 'blob' },
    );
  }

  deleteBackup(fileName: string): Observable<BackupMessageResponse> {
    return this.http.delete<BackupMessageResponse>(
      `${this.apiUrl}/${encodeURIComponent(fileName)}`,
    );
  }
}
