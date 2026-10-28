import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryService } from './inventory.service';

import {
  AppointmentInventoryItem,
  AppointmentInventoryItemRequest,
  InventoryAdjustmentRequest,
  InventoryCategory,
  InventoryCategoryRequest,
  InventoryEntryRequest,
  InventoryExitRequest,
  InventoryItem,
  InventoryItemFilters,
  InventoryItemRequest,
  InventoryMovement,
  InventoryMovementFilters,
  UpdateAppointmentInventoryItemRequest,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryFacade {
  private readonly service = inject(InventoryService);

  getCategories(includeInactive = false): Observable<InventoryCategory[]> {
    return this.service.getCategories(includeInactive);
  }

  getCategoryById(id: number): Observable<InventoryCategory> {
    return this.service.getCategoryById(id);
  }

  createCategory(dto: InventoryCategoryRequest): Observable<InventoryCategory> {
    return this.service.createCategory(dto);
  }

  updateCategory(id: number, dto: InventoryCategoryRequest): Observable<InventoryCategory> {
    return this.service.updateCategory(id, dto);
  }

  activateCategory(id: number): Observable<{ message: string }> {
    return this.service.activateCategory(id);
  }

  deactivateCategory(id: number): Observable<{ message: string }> {
    return this.service.deactivateCategory(id);
  }

  getItems(filters: InventoryItemFilters = {}): Observable<InventoryItem[]> {
    return this.service.getItems(filters);
  }

  getItemById(id: number): Observable<InventoryItem> {
    return this.service.getItemById(id);
  }

  createItem(dto: InventoryItemRequest): Observable<InventoryItem> {
    return this.service.createItem(dto);
  }

  updateItem(id: number, dto: InventoryItemRequest): Observable<InventoryItem> {
    return this.service.updateItem(id, dto);
  }

  activateItem(id: number): Observable<{ message: string }> {
    return this.service.activateItem(id);
  }

  deactivateItem(id: number): Observable<{ message: string }> {
    return this.service.deactivateItem(id);
  }

  registerEntry(dto: InventoryEntryRequest): Observable<InventoryMovement> {
    return this.service.registerEntry(dto);
  }

  registerAdjustment(dto: InventoryAdjustmentRequest): Observable<InventoryMovement> {
    return this.service.registerAdjustment(dto);
  }

  registerExit(dto: InventoryExitRequest): Observable<InventoryMovement> {
    return this.service.registerExit(dto);
  }

  getMovements(filters: InventoryMovementFilters = {}): Observable<InventoryMovement[]> {
    return this.service.getMovements(filters);
  }

  getMovementById(id: number): Observable<InventoryMovement> {
    return this.service.getMovementById(id);
  }

  getAppointmentItems(appointmentId: number): Observable<AppointmentInventoryItem[]> {
    return this.service.getAppointmentItems(appointmentId);
  }

  addAppointmentItem(
    appointmentId: number,
    dto: AppointmentInventoryItemRequest,
  ): Observable<AppointmentInventoryItem> {
    return this.service.addAppointmentItem(appointmentId, dto);
  }

  updateAppointmentItem(
    appointmentId: number,
    id: number,
    dto: UpdateAppointmentInventoryItemRequest,
  ): Observable<AppointmentInventoryItem> {
    return this.service.updateAppointmentItem(appointmentId, id, dto);
  }

  removeAppointmentItem(appointmentId: number, id: number): Observable<{ message: string }> {
    return this.service.removeAppointmentItem(appointmentId, id);
  }

  getErrorMessage(response: unknown, fallback = 'No fue posible completar la operación.'): string {
    const httpError = response as {
      error?: { message?: string; title?: string };
      message?: string;
    };

    return httpError?.error?.message || httpError?.error?.title || httpError?.message || fallback;
  }
}
