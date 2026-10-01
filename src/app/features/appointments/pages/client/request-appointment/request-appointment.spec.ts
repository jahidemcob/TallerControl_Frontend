import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestAppointmentComponent } from './request-appointment';
import { AppointmentFacade } from '../../../services/appointment.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mocks base ───────────────────────────────────────────────────────────────

const mockService = (overrides = {}): any => ({
  idServicio: 1,
  nombreServicio: 'Cambio de aceite',
  descripcion: 'Cambio completo de aceite',
  precioBase: 50000,
  activo: true,
  ...overrides,
});

const mockMotorbike = (overrides = {}): any => ({
  idMoto: 10,
  marca: 'Honda',
  modelo: 'CB500',
  placa: 'ABC123',
  activo: true,
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('RequestAppointmentComponent', () => {
  let component: RequestAppointmentComponent;
  let fixture: ComponentFixture<RequestAppointmentComponent>;
  let appointmentFacadeMock: any;
  let servicesFacadeMock: any;
  let motorbikeFacadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    appointmentFacadeMock = {
      createAppointment: vi.fn().mockReturnValue(of({})),
      mapBackendErrors: vi.fn().mockReturnValue({ general: 'Error del servidor' }),
    };

    servicesFacadeMock = {
      getServiciosActivos: vi.fn().mockReturnValue(of([mockService()])),
    };

    motorbikeFacadeMock = {
      getMotorbikes: vi.fn().mockReturnValue(of([mockMotorbike()])),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RequestAppointmentComponent],
      providers: [
        { provide: AppointmentFacade, useValue: appointmentFacadeMock },
        { provide: ServicesFacade, useValue: servicesFacadeMock },
        { provide: MotorbikeFacade, useValue: motorbikeFacadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── helpers ──────────────────────────────────────────────────

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  function fillValidForm() {
    component.idMotoSelected = 10;
    component.fechaCita = '2099-12-01';
    component.horaCita = '10:00';
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
  }

  // ─── ngOnInit ─────────────────────────────────────────────────

  it('carga servicios activos en ngOnInit', () => {
    expect(servicesFacadeMock.getServiciosActivos).toHaveBeenCalled();
    expect(component.services).toHaveLength(1);
  });

  it('carga motos en ngOnInit', () => {
    expect(motorbikeFacadeMock.getMotorbikes).toHaveBeenCalled();
  });

  it('filtra solo motos activas en loadMotorbikes', () => {
    motorbikeFacadeMock.getMotorbikes.mockReturnValue(
      of([mockMotorbike({ activo: true }), mockMotorbike({ idMoto: 11, activo: false })]),
    );
    component.loadMotorbikes();
    expect(component.motorbikes).toHaveLength(1);
    expect(component.motorbikes[0].idMoto).toBe(10);
  });

  it('calcula minFecha como mañana', () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const expected = manana.toISOString().split('T')[0];
    expect(component.minFecha).toBe(expected);
  });

  it('maneja error en loadServices silenciosamente', () => {
    servicesFacadeMock.getServiciosActivos.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.loadServices()).not.toThrow();
  });

  it('maneja error en loadMotorbikes silenciosamente', () => {
    motorbikeFacadeMock.getMotorbikes.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.loadMotorbikes()).not.toThrow();
  });

  // ─── isSelected ───────────────────────────────────────────────

  it('isSelected retorna false cuando el servicio no está seleccionado', () => {
    component.selectedServices = [];
    expect(component.isSelected(mockService())).toBe(false);
  });

  it('isSelected retorna true cuando el servicio está seleccionado', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    expect(component.isSelected(mockService())).toBe(true);
  });

  // ─── toggleService ────────────────────────────────────────────

  it('toggleService agrega servicio si no estaba seleccionado', () => {
    component.selectedServices = [];
    component.toggleService(mockService());
    expect(component.selectedServices).toHaveLength(1);
    expect(component.selectedServices[0].service.idServicio).toBe(1);
  });

  it('toggleService usa precioBase al agregar', () => {
    component.selectedServices = [];
    component.toggleService(mockService({ precioBase: 75000 }));
    expect(component.selectedServices[0].precioUnitario).toBe(75000);
  });

  it('toggleService quita servicio si ya estaba seleccionado', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    component.toggleService(mockService());
    expect(component.selectedServices).toHaveLength(0);
  });

  it('toggleService no afecta otros servicios seleccionados', () => {
    const s2 = mockService({ idServicio: 2, nombreServicio: 'Frenos' });
    component.selectedServices = [
      { service: mockService(), precioUnitario: 50000 },
      { service: s2, precioUnitario: 30000 },
    ];
    component.toggleService(mockService());
    expect(component.selectedServices).toHaveLength(1);
    expect(component.selectedServices[0].service.idServicio).toBe(2);
  });

  // ─── total ────────────────────────────────────────────────────

  it('total retorna 0 cuando no hay servicios seleccionados', () => {
    component.selectedServices = [];
    expect(component.total).toBe(0);
  });

  it('total suma los precios de servicios seleccionados', () => {
    component.selectedServices = [
      { service: mockService(), precioUnitario: 50000 },
      { service: mockService({ idServicio: 2 }), precioUnitario: 30000 },
    ];
    expect(component.total).toBe(80000);
  });

  // ─── removeService ────────────────────────────────────────────

  it('removeService quita el servicio por idServicio', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    component.removeService(1);
    expect(component.selectedServices).toHaveLength(0);
  });

  it('removeService no afecta otros servicios', () => {
    const s2 = mockService({ idServicio: 2 });
    component.selectedServices = [
      { service: mockService(), precioUnitario: 50000 },
      { service: s2, precioUnitario: 30000 },
    ];
    component.removeService(1);
    expect(component.selectedServices).toHaveLength(1);
    expect(component.selectedServices[0].service.idServicio).toBe(2);
  });

  // ─── solicitarCita — validaciones ─────────────────────────────

  it('solicitarCita muestra error si no hay moto seleccionada', () => {
    component.idMotoSelected = 0;
    component.fechaCita = '2099-12-01';
    component.horaCita = '10:00';
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    component.solicitarCita();
    expect(component.errores.general).toBe('Debes seleccionar una motocicleta.');
    expect(appointmentFacadeMock.createAppointment).not.toHaveBeenCalled();
  });

  it('solicitarCita muestra error si no hay fecha', () => {
    component.idMotoSelected = 10;
    component.fechaCita = '';
    component.horaCita = '10:00';
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    component.solicitarCita();
    expect(component.errores.general).toBe('Debes seleccionar una fecha.');
  });

  it('solicitarCita muestra error si no hay hora', () => {
    component.idMotoSelected = 10;
    component.fechaCita = '2099-12-01';
    component.horaCita = '';
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    component.solicitarCita();
    expect(component.errores.general).toBe('Debes seleccionar una hora.');
  });

  it('solicitarCita muestra error si no hay servicios', () => {
    component.idMotoSelected = 10;
    component.fechaCita = '2099-12-01';
    component.horaCita = '10:00';
    component.selectedServices = [];
    component.solicitarCita();
    expect(component.errores.general).toBe('Debes agregar al menos un servicio.');
  });

  it('solicitarCita limpia errores previos antes de validar', () => {
    component.errores = { general: 'error anterior' };
    component.idMotoSelected = 0;
    component.solicitarCita();
    // El error se reescribe con la primera validación fallida
    expect(component.errores.general).toBe('Debes seleccionar una motocicleta.');
  });

  // ─── solicitarCita — envío ────────────────────────────────────

  it('solicitarCita llama a createAppointment con DTO correcto', () => {
    fillValidForm();
    component.solicitarCita();
    expect(appointmentFacadeMock.createAppointment).toHaveBeenCalledWith({
      idMoto: 10,
      fechaCita: '2099-12-01',
      horaCita: '10:00:00',
      detalles: [{ idServicio: 1, precioUnitario: 50000 }],
    });
  });

  it('solicitarCita agrega :00 a la hora al construir el DTO', () => {
    fillValidForm();
    component.horaCita = '14:00';
    component.solicitarCita();
    const dto = appointmentFacadeMock.createAppointment.mock.calls[0][0];
    expect(dto.horaCita).toBe('14:00:00');
  });

  it('solicitarCita navega a /cliente/citas en éxito', () => {
    fillValidForm();
    component.solicitarCita();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/citas']);
  });

  it('solicitarCita asigna errores del backend en fallo', () => {
    fillValidForm();
    appointmentFacadeMock.createAppointment.mockReturnValue(throwError(() => new Error('fail')));
    component.solicitarCita();
    expect(appointmentFacadeMock.mapBackendErrors).toHaveBeenCalled();
    expect(component.errores.general).toBe('Error del servidor');
  });

  it('solicitarCita construye detalles con todos los servicios seleccionados', () => {
    component.idMotoSelected = 10;
    component.fechaCita = '2099-12-01';
    component.horaCita = '10:00';
    component.selectedServices = [
      { service: mockService({ idServicio: 1 }), precioUnitario: 50000 },
      { service: mockService({ idServicio: 2 }), precioUnitario: 30000 },
    ];
    component.solicitarCita();
    const dto = appointmentFacadeMock.createAppointment.mock.calls[0][0];
    expect(dto.detalles).toHaveLength(2);
    expect(dto.detalles[1]).toEqual({ idServicio: 2, precioUnitario: 30000 });
  });

  // ─── trackById ────────────────────────────────────────────────

  it('trackById retorna idServicio del item', () => {
    expect(component.trackById(0, mockService({ idServicio: 7 }))).toBe(7);
  });

  // ─── HTML ─────────────────────────────────────────────────────

  it('muestra el título Solicitar Cita', () => {
    expectText('Solicitar Cita');
  });

  it('muestra las horas disponibles en el select', () => {
    expectText('09:00');
    expectText('16:00');
  });

  it('muestra los servicios disponibles como cards', () => {
    fixture.detectChanges();
    expectText('Cambio de aceite');
  });

  it('muestra mensaje cuando no hay servicios disponibles', () => {
    component.services = [];
    fixture.detectChanges();
    expectText('No hay servicios disponibles');
  });

  it('muestra mensaje de ningún servicio agregado cuando selectedServices está vacío', () => {
    component.selectedServices = [];
    fixture.detectChanges();
    expectText('Ningún servicio agregado');
  });

  it('muestra el total calculado en el resumen', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    fixture.detectChanges();
    expectText('50');
  });

  it('muestra error general en el HTML cuando está seteado', () => {
    component.errores = { general: 'Debes seleccionar una motocicleta.' };
    fixture.detectChanges();
    expectText('Debes seleccionar una motocicleta.');
  });

  it('no muestra el bloque de error cuando errores.general está vacío', () => {
    component.errores = {};
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.error');
    expect(errorEl).toBeNull();
  });

  it('click en Agregar llama a toggleService', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'toggleService');
    fixture.nativeElement.querySelector('.btn-add').click();
    expect(spy).toHaveBeenCalledWith(component.services[0]);
  });

  it('botón muestra Quitar cuando servicio ya está seleccionado', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-add');
    expect(btn.textContent.trim()).toBe('Quitar');
  });

  it('click en ✕ de servicio seleccionado llama a removeService', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'removeService');
    fixture.nativeElement.querySelector('.btn-remove').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en Solicitar cita llama a solicitarCita', () => {
    const spy = vi.spyOn(component, 'solicitarCita');
    fixture.nativeElement.querySelector('.btn-solicitar').click();
    expect(spy).toHaveBeenCalled();
  });

  it('card de servicio tiene clase selected cuando está seleccionado', () => {
    component.selectedServices = [{ service: mockService(), precioUnitario: 50000 }];
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.service-card');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('card de servicio no tiene clase selected cuando no está seleccionado', () => {
    component.selectedServices = [];
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.service-card');
    expect(card.classList.contains('selected')).toBe(false);
  });
});
