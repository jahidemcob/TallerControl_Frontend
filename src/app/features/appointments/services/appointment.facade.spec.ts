import { TestBed } from '@angular/core/testing';
import { AppointmentFacade } from './appointment.facade';
import { AppointmentService } from './appointment.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AppointmentFacade', () => {
  let facade: AppointmentFacade;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getAll: vi.fn(),
      getByState: vi.fn(),
      assignEmployee: vi.fn(),
      updateState: vi.fn(),
      getByEmployee: vi.fn(),
      getById: vi.fn(),
      getByUser: vi.fn(),
      create: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AppointmentFacade, { provide: AppointmentService, useValue: serviceMock }],
    });

    facade = TestBed.inject(AppointmentFacade);
  });

  // ─── Delegaciones simples ─────────────────────────────────────

  it('getAll delega al servicio', () => {
    serviceMock.getAll.mockReturnValue(of([]));
    facade.getAll().subscribe();
    expect(serviceMock.getAll).toHaveBeenCalled();
  });

  it('getByState delega al servicio con el estado', () => {
    serviceMock.getByState.mockReturnValue(of([]));
    facade.getByState('Pendiente').subscribe();
    expect(serviceMock.getByState).toHaveBeenCalledWith('Pendiente');
  });

  it('assignEmployee delega al servicio con id y dto', () => {
    const dto = { idUsuario: 5 };
    serviceMock.assignEmployee.mockReturnValue(of({}));
    facade.assignEmployee(1, dto).subscribe();
    expect(serviceMock.assignEmployee).toHaveBeenCalledWith(1, dto);
  });

  it('updateState envuelve el estado en el dto correcto', () => {
    serviceMock.updateState.mockReturnValue(of({}));
    facade.updateState(1, 'Rechazada').subscribe();
    expect(serviceMock.updateState).toHaveBeenCalledWith(1, { nuevoEstado: 'Rechazada' });
  });

  it('getByEmployee delega al servicio', () => {
    serviceMock.getByEmployee.mockReturnValue(of([]));
    facade.getByEmployee().subscribe();
    expect(serviceMock.getByEmployee).toHaveBeenCalled();
  });

  it('getById delega al servicio con el id', () => {
    serviceMock.getById.mockReturnValue(of({}));
    facade.getById(7).subscribe();
    expect(serviceMock.getById).toHaveBeenCalledWith(7);
  });

  it('getByUser delega al servicio', () => {
    serviceMock.getByUser.mockReturnValue(of([]));
    facade.getByUser().subscribe();
    expect(serviceMock.getByUser).toHaveBeenCalled();
  });

  it('createAppointment delega al servicio con el dto', () => {
    const dto = { idMoto: 10, fechaCita: '2024-01-01', horaCita: '10:00' };
    serviceMock.create.mockReturnValue(of({}));
    facade.createAppointment(dto as any).subscribe();
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  // ─── getByUserFull ────────────────────────────────────────────

  it('getByUserFull retorna [] cuando no hay summaries', () => {
    serviceMock.getByUser.mockReturnValue(of([]));

    let resultado: any;
    facade.getByUserFull().subscribe((r) => (resultado = r));

    expect(resultado).toEqual([]);
    expect(serviceMock.getById).not.toHaveBeenCalled();
  });

  it('getByUserFull llama getById por cada summary', () => {
    const summaries = [{ idPedido: 1 }, { idPedido: 2 }];
    const full1 = { idPedido: 1, detalles: [] };
    const full2 = { idPedido: 2, detalles: [] };

    serviceMock.getByUser.mockReturnValue(of(summaries));
    serviceMock.getById.mockImplementation((id: number) => (id === 1 ? of(full1) : of(full2)));

    let resultado: any;
    facade.getByUserFull().subscribe((r) => (resultado = r));

    expect(serviceMock.getById).toHaveBeenCalledWith(1);
    expect(serviceMock.getById).toHaveBeenCalledWith(2);
    expect(resultado).toEqual([full1, full2]);
  });

  // ─── mapBackendErrors ─────────────────────────────────────────

  it('mapea AppointmentNotFoundException a general', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'AppointmentNotFoundException',
        message: 'Cita no encontrada',
      },
    });
    expect(result.general).toBe('Cita no encontrada');
  });

  it('mapea AppointmentValidationException a general', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'AppointmentValidationException',
        message: 'Datos inválidos',
      },
    });
    expect(result.general).toBe('Datos inválidos');
  });

  it('mapea InvalidAppointmentStateTransitionException a general', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'InvalidAppointmentStateTransitionException',
        message: 'Transición inválida',
      },
    });
    expect(result.general).toBe('Transición inválida');
  });

  it('mapea InvalidEmployeeAssignmentException a general', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'InvalidEmployeeAssignmentException',
        message: 'Empleado inválido',
      },
    });
    expect(result.general).toBe('Empleado inválido');
  });

  it('mapea error desconocido con mensaje del servidor', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'OtroError',
        message: 'Algo salió mal',
      },
    });
    expect(result.general).toBe('Algo salió mal');
  });

  it('mapea error desconocido sin mensaje como Error desconocido', () => {
    const result = facade.mapBackendErrors({});
    expect(result.general).toBe('Error desconocido');
  });

  it('mapea error con error vacío como Error desconocido', () => {
    const result = facade.mapBackendErrors({ error: {} });
    expect(result.general).toBe('Error desconocido');
  });
});
