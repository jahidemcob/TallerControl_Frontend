import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  AppointmentSummary,
  AppointmentState,
  CreateAppointmentDto,
  AssignEmployeeDto,
  UpdateAppointmentStateDto,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Appointment`;

  // Admin
  getAll(): Observable<AppointmentSummary[]> {
    return this.http.get<AppointmentSummary[]>(this.apiUrl);
  }

  getByState(state: AppointmentState): Observable<AppointmentSummary[]> {
    return this.http.get<AppointmentSummary[]>(`${this.apiUrl}/state/${state}`);
  }

  assignEmployee(id: number, dto: AssignEmployeeDto): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/assign`, dto);
  }

  // Admin + Empleado
  updateState(id: number, dto: UpdateAppointmentStateDto): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/state`, dto);
  }

  getByEmployee(): Observable<AppointmentSummary[]> {
    return this.http.get<AppointmentSummary[]>(`${this.apiUrl}/employee`);
  }

  // Admin + Cliente
  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getByUser(): Observable<AppointmentSummary[]> {
    return this.http.get<AppointmentSummary[]>(`${this.apiUrl}/user`);
  }

  // Cliente
  create(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, dto);
  }
}
