import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MotorbikeService } from './motorbike.service';
import { Motorbike, CreateMotorbike, UpdateMotorbike } from '../models/motorbike.model';

export interface BackendErrors {
  marca?: string;
  modelo?: string;
  placa?: string;
  cilindraje?: string;
  anio?: string;
  general?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MotorbikeFacade {
  constructor(private readonly service: MotorbikeService) {}

  getMotorbikes(): Observable<Motorbike[]> {
    return this.service.getAllMotorbikes();
  }

  getMotorbikeById(id: number): Observable<Motorbike> {
    return this.service.getMotorbikeById(id);
  }

  actualizarMotorbike(motorbike: UpdateMotorbike): Observable<{ message: string }> {
    return this.service.updateMotorbike(motorbike);
  }

  toggleEstado(id: number): Observable<{ message: string; status: boolean }> {
    return this.service.toggleMotorbikeStatus(id);
  }

  crearMotorbike(motorbike: CreateMotorbike): Observable<Motorbike> {
    return this.service.createMotorbike(motorbike);
  }

  mapBackendErrors(errorResponse: any): BackendErrors {
    const err = errorResponse?.error;

    const errorMap: Record<string, keyof BackendErrors> = {
      MotorbikeAlreadyExistsException: 'placa',
      InvalidYearException: 'anio',
      InvalidCilindrajeException: 'cilindraje',
    };

    const errores: BackendErrors = {};

    if (err?.error && errorMap[err.error]) {
      errores[errorMap[err.error]] = err.message;
    } else {
      errores.general = err?.message || 'Error desconocido';
    }

    return errores;
  }
}
