import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/inventory`;

  // CATEGORÍAS
  getCategories(includeInactive = false): Observable<InventoryCategory[]> {
    const params = includeInactive ? new HttpParams().set('includeInactive', true) : undefined;

    return this.http.get<InventoryCategory[]>(`${this.apiUrl}/categories`, { params });
  }

  getCategoryById(id: number): Observable<InventoryCategory> {
    return this.http.get<InventoryCategory>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(dto: InventoryCategoryRequest): Observable<InventoryCategory> {
    return this.http.post<InventoryCategory>(`${this.apiUrl}/categories`, dto);
  }

  updateCategory(id: number, dto: InventoryCategoryRequest): Observable<InventoryCategory> {
    return this.http.put<InventoryCategory>(`${this.apiUrl}/categories/${id}`, dto);
  }

  deactivateCategory(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/categories/${id}/deactivate`, {});
  }

  activateCategory(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/categories/${id}/activate`, {});
  }

  // ARTÍCULOS
  getItems(filters: InventoryItemFilters = {}): Observable<InventoryItem[]> {
    let params = new HttpParams();

    if (filters.categoryId != null && filters.categoryId > 0) {
      params = params.set('categoryId', filters.categoryId);
    }

    if (filters.itemType) {
      params = params.set('itemType', filters.itemType);
    }

    if (filters.includeInactive) {
      params = params.set('includeInactive', true);
    }

    if (filters.onlyLowStock) {
      params = params.set('onlyLowStock', true);
    }

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<InventoryItem[]>(`${this.apiUrl}/items`, { params });
  }

  getItemById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/items/${id}`);
  }

  createItem(dto: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/items`, dto);
  }

  updateItem(id: number, dto: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/items/${id}`, dto);
  }

  deactivateItem(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/items/${id}/deactivate`, {});
  }

  activateItem(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/items/${id}/activate`, {});
  }

  // ENTRADAS, AJUSTES Y SALIDAS
  registerEntry(dto: InventoryEntryRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.apiUrl}/movements/entries`, dto);
  }

  registerAdjustment(dto: InventoryAdjustmentRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.apiUrl}/movements/adjustments`, dto);
  }

  registerExit(dto: InventoryExitRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.apiUrl}/movements/exits`, dto);
  }

  // HISTORIAL
  getMovements(filters: InventoryMovementFilters = {}): Observable<InventoryMovement[]> {
    let params = new HttpParams();

    if (filters.inventoryItemId != null && filters.inventoryItemId > 0) {
      params = params.set('inventoryItemId', filters.inventoryItemId);
    }

    if (filters.movementType) {
      params = params.set('movementType', filters.movementType);
    }

    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<InventoryMovement[]>(`${this.apiUrl}/movements`, { params });
  }

  getMovementById(id: number): Observable<InventoryMovement> {
    return this.http.get<InventoryMovement>(`${this.apiUrl}/movements/${id}`);
  }

  // REPUESTOS UTILIZADOS EN REPARACIONES
  getAppointmentItems(appointmentId: number): Observable<AppointmentInventoryItem[]> {
    return this.http.get<AppointmentInventoryItem[]>(
      `${this.apiUrl}/appointments/${appointmentId}/items`,
    );
  }

  addAppointmentItem(
    appointmentId: number,
    dto: AppointmentInventoryItemRequest,
  ): Observable<AppointmentInventoryItem> {
    return this.http.post<AppointmentInventoryItem>(
      `${this.apiUrl}/appointments/${appointmentId}/items`,
      dto,
    );
  }

  updateAppointmentItem(
    appointmentId: number,
    id: number,
    dto: UpdateAppointmentInventoryItemRequest,
  ): Observable<AppointmentInventoryItem> {
    return this.http.put<AppointmentInventoryItem>(
      `${this.apiUrl}/appointments/${appointmentId}/items/${id}`,
      dto,
    );
  }

  removeAppointmentItem(appointmentId: number, id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/appointments/${appointmentId}/items/${id}`,
    );
  }
}
