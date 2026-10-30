import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackupService } from './backup.service';
import {
  BackupFile,
  BackupMessageResponse,
  CreateBackupResponse,
} from '../models/backup.model';

@Injectable({ providedIn: 'root' })
export class BackupFacade {
  private readonly service = inject(BackupService);

  getBackups(): Observable<BackupFile[]> {
    return this.service.getBackups();
  }

  createBackup(): Observable<CreateBackupResponse> {
    return this.service.createBackup();
  }

  downloadBackup(fileName: string): Observable<Blob> {
    return this.service.downloadBackup(fileName);
  }

  deleteBackup(fileName: string): Observable<BackupMessageResponse> {
    return this.service.deleteBackup(fileName);
  }

  getErrorMessage(error: any, fallback: string): string {
    if (error?.status === 401) {
      return 'La sesión no es válida o ha expirado. Inicia sesión nuevamente.';
    }

    if (error?.status === 403) {
      return 'No tienes permisos para realizar esta operación.';
    }

    if (error?.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }

    const message =
      error?.error?.message ??
      error?.error?.detail ??
      error?.message;

    return typeof message === 'string' && message.trim()
      ? message
      : fallback;
  }
}
