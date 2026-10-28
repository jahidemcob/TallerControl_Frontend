import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../core/services/auth';
import { InventoryFacade } from '../../services/inventory.facade';
import { AppointmentInventoryItem, InventoryItem } from '../../models/inventory.model';

@Component({
  selector: 'app-appointment-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './appointment-inventory.html',
  styleUrl: './appointment-inventory.css',
})
export class AppointmentInventoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly facade = inject(InventoryFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  appointmentId = 0;
  isAdmin = false;

  items: InventoryItem[] = [];
  lines: AppointmentInventoryItem[] = [];
  draftQuantities: Record<number, number> = {};

  selectedItemId = 0;
  quantity: number | null = 1;

  loadingItems = false;
  loadingLines = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'administrador';
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));

    if (!Number.isInteger(this.appointmentId) || this.appointmentId <= 0) {
      this.errorMessage = 'El identificador de la cita no es válido.';
      return;
    }

    this.loadItems();
    this.loadLines();
  }

  get hasProcessedItems(): boolean {
    return this.lines.some((line) => line.inventoryProcessed);
  }

  get totalConsumption(): number {
    return this.lines.reduce((total, line) => total + line.subtotal, 0);
  }

  get selectedItem(): InventoryItem | undefined {
    return this.items.find((item) => item.id === Number(this.selectedItemId));
  }

  loadItems(): void {
    this.loadingItems = true;

    this.facade.getItems().subscribe({
      next: (data) => {
        this.items = data;

        if (!this.selectedItemId && data.length) {
          this.selectedItemId = data[0].id;
        }

        this.loadingItems = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(
          err,
          'No fue posible cargar los artículos disponibles.',
        );
        this.loadingItems = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadLines(): void {
    this.loadingLines = true;

    this.facade.getAppointmentItems(this.appointmentId).subscribe({
      next: (data) => {
        this.lines = data;
        this.draftQuantities = {};

        for (const line of data) {
          this.draftQuantities[line.id] = line.quantity;
        }

        this.loadingLines = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(
          err,
          'No fue posible cargar los repuestos de esta reparación.',
        );
        this.loadingLines = false;
        this.cdr.markForCheck();
      },
    });
  }

  addItem(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.hasProcessedItems) {
      this.errorMessage =
        'Esta reparación ya tiene consumos procesados y no admite nuevos artículos.';
      return;
    }

    if (!this.selectedItemId || !this.quantity || this.quantity <= 0) {
      this.errorMessage = 'Selecciona un artículo y una cantidad mayor que cero.';
      return;
    }

    this.saving = true;

    this.facade
      .addAppointmentItem(this.appointmentId, {
        inventoryItemId: Number(this.selectedItemId),
        quantity: Number(this.quantity),
      })
      .subscribe({
        next: () => {
          this.successMessage = 'INVENTORY.APPOINTMENT.ITEM_ADDED';
          this.quantity = 1;

          this.loadLines();
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = this.facade.getErrorMessage(err);
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
  }

  updateQuantity(line: AppointmentInventoryItem): void {
    this.errorMessage = '';
    this.successMessage = '';

    const quantity = Number(this.draftQuantities[line.id]);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.errorMessage = 'La cantidad debe ser mayor que cero.';
      return;
    }

    this.saving = true;

    this.facade.updateAppointmentItem(this.appointmentId, line.id, { quantity }).subscribe({
      next: () => {
        this.successMessage = 'INVENTORY.APPOINTMENT.ITEM_UPDATED';
        this.loadLines();
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeItem(line: AppointmentInventoryItem): void {
    if (line.inventoryProcessed || this.hasProcessedItems) return;

    if (!confirm('¿Retirar este artículo de la reparación?')) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    this.facade.removeAppointmentItem(this.appointmentId, line.id).subscribe({
      next: () => {
        this.successMessage = 'INVENTORY.APPOINTMENT.ITEM_REMOVED';
        this.loadLines();
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.facade.getErrorMessage(err);
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate([this.isAdmin ? '/admin/citas' : '/empleado/citas']);
  }
}
