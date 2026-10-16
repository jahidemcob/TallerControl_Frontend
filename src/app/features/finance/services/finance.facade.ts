import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FinanceService } from './finance.service';
import {
  CreateMovement,
  FinancesSummary,
  FinanceErrors,
  Movement,
  MovementType,
  ApiError,
} from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceFacade {
  constructor(private readonly service: FinanceService) {}

  getMovimientos(): Observable<FinancesSummary> {
    return this.service.getAll();
  }

  getMovimiento(id: number): Observable<Movement> {
    return this.service.getById(id);
  }

  getMovimientosPorTipo(type: MovementType): Observable<FinancesSummary> {
    return this.service.getByType(type);
  }

  registrarIngreso(descripcion: string, monto: number): Observable<Movement> {
    const movement: CreateMovement = {
      tipoMovimiento: 'Ingreso',
      descripcion,
      monto,
    };
    return this.service.create(movement);
  }

  registrarEgreso(descripcion: string, monto: number): Observable<Movement> {
    const movement: CreateMovement = {
      tipoMovimiento: 'Egreso',
      descripcion,
      monto,
    };
    return this.service.create(movement);
  }

  mapBackendErrors(errorResponse: any): FinanceErrors {
    const err: ApiError = errorResponse?.error;
    const errores: FinanceErrors = {};
    errores.general = err?.message || 'Error desconocido';
    return errores;
  }
}
