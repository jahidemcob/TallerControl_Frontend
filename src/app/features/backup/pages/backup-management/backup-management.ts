import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BackupFacade } from '../../services/backup.facade';
import { BackupFile } from '../../models/backup.model';

@Component({
  selector: 'app-backup-management',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './backup-management.html',
  styleUrl: './backup-management.css',
})
export class BackupManagementComponent implements OnInit {
  private readonly facade = inject(BackupFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  backups: BackupFile[] = [];
  loading = false;
  creating = false;
  downloadingFile: string | null = null;
  deletingFile: string | null = null;
  errorMessage = '';
  successMessage = '';

  confirmationVisible = false;
  confirmationAction: 'create' | 'delete' | null = null;
  selectedBackup: BackupFile | null = null;

  ngOnInit(): void {
    this.loadBackups();
  }

  get totalSizeInBytes(): number {
    return this.backups.reduce((total, backup) => total + backup.sizeInBytes, 0);
  }

  loadBackups(): void {
    this.loading = true;
    this.errorMessage = '';

    this.facade.getBackups().subscribe({
      next: (data) => {
        this.backups = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.facade.getErrorMessage(
          error,
          'No fue posible consultar los respaldos.',
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  createBackup(): void {
    if (this.creating) return;

    this.selectedBackup = null;
    this.confirmationAction = 'create';
    this.confirmationVisible = true;
  }

  deleteBackup(backup: BackupFile): void {
    if (this.deletingFile || this.downloadingFile) return;

    this.selectedBackup = backup;
    this.confirmationAction = 'delete';
    this.confirmationVisible = true;
  }

  cancelConfirmation(): void {
    if (this.creating || this.deletingFile) return;

    this.confirmationVisible = false;
    this.confirmationAction = null;
    this.selectedBackup = null;
  }

  confirmAction(): void {
    if (!this.confirmationVisible || !this.confirmationAction) return;

    const action = this.confirmationAction;
    const backup = this.selectedBackup;

    this.confirmationVisible = false;
    this.confirmationAction = null;
    this.selectedBackup = null;

    if (action === 'create') {
      this.executeCreateBackup();
    } else if (action === 'delete' && backup) {
      this.executeDeleteBackup(backup);
    }
  }

  private executeCreateBackup(): void {
    this.creating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.facade.createBackup().subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'BACKUP.MESSAGES.CREATE_SUCCESS';
        this.creating = false;
        this.loadBackups();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.facade.getErrorMessage(
          error,
          'No fue posible crear la copia de seguridad.',
        );
        this.creating = false;
        this.cdr.markForCheck();
      },
    });
  }

  private executeDeleteBackup(backup: BackupFile): void {
    this.deletingFile = backup.fileName;
    this.errorMessage = '';
    this.successMessage = '';

    this.facade.deleteBackup(backup.fileName).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'BACKUP.MESSAGES.DELETE_SUCCESS';
        this.backups = this.backups.filter((item) => item.fileName !== backup.fileName);
        this.deletingFile = null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.facade.getErrorMessage(
          error,
          'No fue posible eliminar el respaldo.',
        );
        this.deletingFile = null;
        this.cdr.markForCheck();
      },
    });
  }

  downloadBackup(backup: BackupFile): void {
    if (this.downloadingFile) return;

    this.downloadingFile = backup.fileName;
    this.errorMessage = '';

    this.facade.downloadBackup(backup.fileName).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = backup.fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        this.downloadingFile = null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.facade.getErrorMessage(
          error,
          'No fue posible descargar el archivo de respaldo.',
        );
        this.downloadingFile = null;
        this.cdr.markForCheck();
      },
    });
  }


  formatSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  trackByFileName(_: number, backup: BackupFile): string {
    return backup.fileName;
  }
}
