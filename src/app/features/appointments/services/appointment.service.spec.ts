import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  AppointmentSummary,
  AssignEmployeeDto,
  UpdateAppointmentStateDto,
} from '../models/appointment.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/Appointment`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService],
    });

    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getAll ──────────────────────────────────────────────────

  it('getAll debería hacer GET a la URL base', () => {
    const mock: AppointmentSummary[] = [
      {
        idPedido: 1,
        idMoto: 10,
        nombreCliente: 'Juan',
        estadoCita: 'Pendiente',
        fechaCita: '2024-01-01',
        horaCita: '10:00',
        total: 50000,
      } as AppointmentSummary,
    ];

    service.getAll().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── getByState ───────────────────────────────────────────────

  it('getByState debería hacer GET con el estado en la URL', () => {
    const mock: AppointmentSummary[] = [];

    service.getByState('Pendiente').subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/state/Pendiente`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── getById ─────────────────────────────────────────────────

  it('getById debería hacer GET con el id en la URL', () => {
    const mock = { idPedido: 1, estadoCita: 'Pendiente' } as Appointment;

    service.getById(1).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── getByUser ────────────────────────────────────────────────

  it('getByUser debería hacer GET a /user', () => {
    const mock: AppointmentSummary[] = [];

    service.getByUser().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/user`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── getByEmployee ────────────────────────────────────────────

  it('getByEmployee debería hacer GET a /employee', () => {
    const mock: AppointmentSummary[] = [];

    service.getByEmployee().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/employee`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── assignEmployee ───────────────────────────────────────────

  it('assignEmployee debería hacer PATCH a /:id/assign con el dto', () => {
    const dto: AssignEmployeeDto = { idUsuario: 5 };
    const mock = { idPedido: 1, estadoCita: 'Agendada' } as Appointment;

    service.assignEmployee(1, dto).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/assign`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });

  // ─── updateState ─────────────────────────────────────────────

  it('updateState debería hacer PATCH a /:id/state con el dto', () => {
    const dto: UpdateAppointmentStateDto = { nuevoEstado: 'Rechazada' };
    const mock = { idPedido: 1, estadoCita: 'Rechazada' } as Appointment;

    service.updateState(1, dto).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/state`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });

  // ─── create ──────────────────────────────────────────────────

  it('create debería hacer POST a la URL base con el dto', () => {
    const dto = { idMoto: 10, fechaCita: '2024-01-01', horaCita: '10:00' };
    const mock = { idPedido: 99, estadoCita: 'Pendiente' } as Appointment;

    service.create(dto as any).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });
});
