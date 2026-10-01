import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, forkJoin, of } from 'rxjs';
import { AppointmentService } from './appointment.service';
import {
  Appointment,
  AppointmentSummary,
  AppointmentState,
  AppointmentErrors,
  ApiError,
  CreateAppointmentDto,
  AssignEmployeeDto,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentFacade {
  private readonly service = inject(AppointmentService);

  // Admin
  getAll(): Observable<AppointmentSummary[]> {
    return this.service.getAll();
  }

  getByState(state: AppointmentState): Observable<AppointmentSummary[]> {
    return this.service.getByState(state);
  }

  assignEmployee(id: number, dto: AssignEmployeeDto): Observable<Appointment> {
    return this.service.assignEmployee(id, dto);
  }

  // Admin + Empleado
  updateState(id: number, state: AppointmentState): Observable<Appointment> {
    return this.service.updateState(id, { nuevoEstado: state });
  }

  getByEmployee(): Observable<AppointmentSummary[]> {
    return this.service.getByEmployee();
  }

  // Admin + Cliente
  getById(id: number): Observable<Appointment> {
    return this.service.getById(id);
  }

  getByUser(): Observable<AppointmentSummary[]> {
    return this.service.getByUser();
  }

  // Trae citas completas con detalles para el cliente optimizado con of([])
  getByUserFull(): Observable<Appointment[]> {
    return this.service.getByUser().pipe(
      switchMap((summaries) => {
        if (summaries.length === 0) return of([]); // Solución limpia y directa con RxJS
        return forkJoin(summaries.map((s) => this.service.getById(s.idPedido)));
      }),
    );
  }

  // Cliente
  createAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.service.create(dto);
  }

  mapBackendErrors(errorResponse: any): AppointmentErrors {
    const err: ApiError = errorResponse?.error;

    const errorMap: Record<string, keyof AppointmentErrors> = {
      AppointmentNotFoundException: 'general',
      AppointmentValidationException: 'general',
      InvalidAppointmentStateTransitionException: 'general',
      InvalidEmployeeAssignmentException: 'general',
    };

    const errores: AppointmentErrors = {};

    if (err?.error && errorMap[err.error]) {
      errores[errorMap[err.error]] = err.message;
    } else {
      errores.general = err?.message || 'Error desconocido';
    }

    return errores;
  }
}
