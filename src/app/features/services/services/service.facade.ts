import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServicesService } from './services.service';
import { Service, CreateService, UpdateService } from '../models/service.model';

export interface BackendErrors {
  nombreServicio?: string;
  descripcion?: string;
  precioBase?: string;
  general?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServicesFacade {
  constructor(private readonly service: ServicesService) {}

  getServicios(): Observable<Service[]> {
    return this.service.getAllServices();
  }

  getServiciosActivos(): Observable<Service[]> {
    return this.service.getActiveServices();
  }

  getServicioById(id: number): Observable<Service> {
    return this.service.getServiceById(id);
  }

  actualizarServicio(service: UpdateService): Observable<{ message: string }> {
    return this.service.updateService(service);
  }

  toggleEstado(id: number): Observable<{ message: string; status: boolean }> {
    return this.service.toggleServiceStatus(id);
  }

  crearServicio(service: CreateService): Observable<Service> {
    return this.service.createService(service);
  }

  mapBackendErrors(errorResponse: any): BackendErrors {
    const err = errorResponse?.error;

    const errorMap: Record<string, keyof BackendErrors> = {
      ServiceAlreadyExistsException: 'nombreServicio',
      InvalidPriceException: 'precioBase',
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
