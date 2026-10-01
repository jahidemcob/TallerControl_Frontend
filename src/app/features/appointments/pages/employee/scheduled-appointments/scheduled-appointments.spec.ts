import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduledAppointmentsComponent } from './scheduled-appointments';
import { AppointmentFacade } from '../../../services/appointment.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';

// ─── Mocks base ───────────────────────────────────────────────────────────────

const mockAppointmentSummary = (overrides = {}): any => ({
  idPedido: 1,
  nombreCliente: 'Juan Pérez',
  idMoto: 10,
  estadoCita: 'Agendada',
  fechaCita: '2099-12-01',
  ...overrides,
});

const mockAppointment = (overrides = {}): any => ({
  idPedido: 1,
  nombreCliente: 'Juan Pérez',
  idMoto: 10,
  estadoCita: 'Agendada',
  fechaCita: '2099-12-01',
  fechaCreacionCita: '2099-11-01',
  horaCita: '10:00',
  total: 80000,
  detalles: [
    { idServicio: 1, subTotal: 50000 },
    { idServicio: 2, subTotal: 30000 },
  ],
  ...overrides,
});

const mockMotorbike = (overrides = {}): any => ({
  idMoto: 10,
  marca: 'Honda',
  modelo: 'CB500',
  placa: 'ABC123',
  ...overrides,
});

const mockService = (overrides = {}): any => ({
  idServicio: 1,
  nombreServicio: 'Cambio de aceite',
  precioBase: 50000,
  activo: true,
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ScheduledAppointmentsComponent', () => {
  let component: ScheduledAppointmentsComponent;
  let fixture: ComponentFixture<ScheduledAppointmentsComponent>;
  let appointmentFacadeMock: any;
  let motorbikeFacadeMock: any;
  let servicesFacadeMock: any;

  beforeEach(async () => {
    appointmentFacadeMock = {
      getByEmployee: vi.fn().mockReturnValue(of([mockAppointmentSummary()])),
      getById: vi.fn().mockReturnValue(of(mockAppointment())),
      updateState: vi.fn().mockReturnValue(of(mockAppointment({ estadoCita: 'EnProceso' }))),
    };

    motorbikeFacadeMock = {
      getMotorbikeById: vi.fn().mockReturnValue(of(mockMotorbike())),
    };

    servicesFacadeMock = {
      getServicios: vi.fn().mockReturnValue(of([mockService()])),
    };

    await TestBed.configureTestingModule({
      imports: [ScheduledAppointmentsComponent],
      providers: [
        { provide: AppointmentFacade, useValue: appointmentFacadeMock },
        { provide: MotorbikeFacade, useValue: motorbikeFacadeMock },
        { provide: ServicesFacade, useValue: servicesFacadeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── helpers ──────────────────────────────────────────────────

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  // ─── ngOnInit ─────────────────────────────────────────────────

  it('carga servicios en ngOnInit', () => {
    expect(servicesFacadeMock.getServicios).toHaveBeenCalled();
    expect(component.services).toHaveLength(1);
  });

  it('carga citas del empleado en ngOnInit', () => {
    expect(appointmentFacadeMock.getByEmployee).toHaveBeenCalled();
    expect(component.appointments).toHaveLength(1);
  });

  it('carga la motocicleta al cargar citas con idMoto nuevo', () => {
    expect(motorbikeFacadeMock.getMotorbikeById).toHaveBeenCalledWith(10);
    expect(component.motorbikesMap.has(10)).toBe(true);
  });

  it('no vuelve a pedir motos que ya están en el mapa', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    appointmentFacadeMock.getMotorbikeById = vi.fn().mockReturnValue(of(mockMotorbike()));
    component.loadAppointments();
    expect(motorbikeFacadeMock.getMotorbikeById).not.toHaveBeenCalledTimes(2);
  });

  it('maneja error al cargar servicios silenciosamente', () => {
    servicesFacadeMock.getServicios.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('maneja error al cargar citas silenciosamente', () => {
    appointmentFacadeMock.getByEmployee.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.loadAppointments()).not.toThrow();
  });

  it('maneja error al cargar motocicleta con catchError (retorna null)', () => {
    motorbikeFacadeMock.getMotorbikeById.mockReturnValue(throwError(() => new Error('fail')));
    appointmentFacadeMock.getByEmployee.mockReturnValue(
      of([mockAppointmentSummary({ idMoto: 99 })]),
    );
    expect(() => component.loadAppointments()).not.toThrow();
  });

  it('no agrega motocicleta nula al mapa', () => {
    // catchError retorna of(null), el mapa no debe tener null
    motorbikeFacadeMock.getMotorbikeById.mockReturnValue(of(null));
    component.motorbikesMap.clear();
    appointmentFacadeMock.getByEmployee.mockReturnValue(
      of([mockAppointmentSummary({ idMoto: 55 })]),
    );
    component.loadAppointments();
    expect(component.motorbikesMap.has(55)).toBe(false);
  });

  it('no llama a getMotorbikeById cuando no hay ids nuevos', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    motorbikeFacadeMock.getMotorbikeById.mockClear();
    component.loadAppointments();
    expect(motorbikeFacadeMock.getMotorbikeById).not.toHaveBeenCalled();
  });

  // ─── appointmentsFiltradas ────────────────────────────────────

  it('retorna todas las citas cuando filtro es Todas', () => {
    component.appointments = [
      mockAppointmentSummary({ estadoCita: 'Agendada' }),
      mockAppointmentSummary({ idPedido: 2, estadoCita: 'EnProceso' }),
      mockAppointmentSummary({ idPedido: 3, estadoCita: 'Completada' }),
    ];
    component.filtroEstado = 'Todas';
    expect(component.appointmentsFiltradas).toHaveLength(3);
  });

  it('filtra por estado Agendada correctamente', () => {
    component.appointments = [
      mockAppointmentSummary({ estadoCita: 'Agendada' }),
      mockAppointmentSummary({ idPedido: 2, estadoCita: 'EnProceso' }),
    ];
    component.filtroEstado = 'Agendada';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].estadoCita).toBe('Agendada');
  });

  it('filtra por estado EnProceso correctamente', () => {
    component.appointments = [
      mockAppointmentSummary({ estadoCita: 'Agendada' }),
      mockAppointmentSummary({ idPedido: 2, estadoCita: 'EnProceso' }),
    ];
    component.filtroEstado = 'EnProceso';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].estadoCita).toBe('EnProceso');
  });

  it('filtra por estado Completada correctamente', () => {
    component.appointments = [
      mockAppointmentSummary({ estadoCita: 'Completada' }),
      mockAppointmentSummary({ idPedido: 2, estadoCita: 'Agendada' }),
    ];
    component.filtroEstado = 'Completada';
    expect(component.appointmentsFiltradas).toHaveLength(1);
  });

  it('filtra por fecha correctamente', () => {
    component.appointments = [
      mockAppointmentSummary({ fechaCita: '2099-12-01' }),
      mockAppointmentSummary({ idPedido: 2, fechaCita: '2099-12-15' }),
    ];
    component.filtroFecha = '2099-12-01';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].fechaCita).toBe('2099-12-01');
  });

  it('combina filtro de estado y fecha', () => {
    component.appointments = [
      mockAppointmentSummary({ estadoCita: 'Agendada', fechaCita: '2099-12-01' }),
      mockAppointmentSummary({ idPedido: 2, estadoCita: 'Agendada', fechaCita: '2099-12-15' }),
      mockAppointmentSummary({ idPedido: 3, estadoCita: 'EnProceso', fechaCita: '2099-12-01' }),
    ];
    component.filtroEstado = 'Agendada';
    component.filtroFecha = '2099-12-01';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].idPedido).toBe(1);
  });

  it('retorna lista vacía si no hay coincidencias', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    component.filtroEstado = 'Completada';
    expect(component.appointmentsFiltradas).toHaveLength(0);
  });

  // ─── cambiarFiltro ────────────────────────────────────────────

  it('cambiarFiltro actualiza filtroEstado', () => {
    component.cambiarFiltro('EnProceso');
    expect(component.filtroEstado).toBe('EnProceso');
  });

  it('cambiarFiltro cierra el detalle si había uno abierto', () => {
    component.selectedAppointment = mockAppointment();
    component.cambiarFiltro('Completada');
    expect(component.selectedAppointment).toBeNull();
  });

  it('cambiarFiltro no falla si no había detalle abierto', () => {
    component.selectedAppointment = null;
    expect(() => component.cambiarFiltro('Agendada')).not.toThrow();
  });

  // ─── limpiarFecha ─────────────────────────────────────────────

  it('limpiarFecha resetea filtroFecha a vacío', () => {
    component.filtroFecha = '2099-12-01';
    component.limpiarFecha();
    expect(component.filtroFecha).toBe('');
  });

  // ─── openDetail ───────────────────────────────────────────────

  it('openDetail llama a getById con el idPedido correcto', () => {
    component.openDetail(1);
    expect(appointmentFacadeMock.getById).toHaveBeenCalledWith(1);
  });

  it('openDetail asigna selectedAppointment al recibir datos', () => {
    component.openDetail(1);
    expect(component.selectedAppointment).not.toBeNull();
    expect(component.selectedAppointment?.idPedido).toBe(1);
  });

  it('openDetail usa cache si la cita ya fue cargada', () => {
    const cached = mockAppointment();
    (component as any).appointmentCache.set(1, cached);
    component.openDetail(1);
    expect(appointmentFacadeMock.getById).not.toHaveBeenCalled();
    expect(component.selectedAppointment).toBe(cached);
  });

  it('openDetail cierra el panel si se llama con el mismo idPedido abierto', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    component.openDetail(1);
    expect(component.selectedAppointment).toBeNull();
  });

  it('openDetail pone loadingDetail en true antes de la petición', () => {
    let loadingDuringCall = false;
    appointmentFacadeMock.getById.mockImplementation(() => {
      loadingDuringCall = component.loadingDetail;
      return of(mockAppointment());
    });
    component.openDetail(1);
    expect(loadingDuringCall).toBe(true);
  });

  it('openDetail pone loadingDetail en false tras recibir datos', () => {
    component.openDetail(1);
    expect(component.loadingDetail).toBe(false);
  });

  it('openDetail pone loadingDetail en false en caso de error', () => {
    appointmentFacadeMock.getById.mockReturnValue(throwError(() => new Error('fail')));
    component.openDetail(1);
    expect(component.loadingDetail).toBe(false);
  });

  it('openDetail guarda la cita en cache tras cargarla', () => {
    component.openDetail(1);
    expect((component as any).appointmentCache.has(1)).toBe(true);
  });

  // ─── closeDetail ──────────────────────────────────────────────

  it('closeDetail limpia selectedAppointment', () => {
    component.selectedAppointment = mockAppointment();
    component.closeDetail();
    expect(component.selectedAppointment).toBeNull();
  });

  it('closeDetail pone loadingDetail en false', () => {
    component.loadingDetail = true;
    component.closeDetail();
    expect(component.loadingDetail).toBe(false);
  });

  // ─── enDesarrollo ─────────────────────────────────────────────

  it('enDesarrollo llama a updateState con EnProceso', () => {
    component.enDesarrollo(1);
    expect(appointmentFacadeMock.updateState).toHaveBeenCalledWith(1, 'EnProceso');
  });

  it('enDesarrollo hace optimistic update del estado en la lista', () => {
    component.appointments = [mockAppointmentSummary({ idPedido: 1, estadoCita: 'Agendada' })];
    component.enDesarrollo(1);
    expect(component.appointments[0].estadoCita).toBe('EnProceso');
  });

  it('enDesarrollo actualiza selectedAppointment si está abierto', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1, estadoCita: 'Agendada' });
    component.enDesarrollo(1);
    expect(component.selectedAppointment?.estadoCita).toBe('EnProceso');
  });

  it('enDesarrollo no actualiza selectedAppointment si es diferente idPedido', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 2, estadoCita: 'Agendada' });
    component.appointments = [mockAppointmentSummary({ idPedido: 1, estadoCita: 'Agendada' })];
    component.enDesarrollo(1);
    expect(component.selectedAppointment?.estadoCita).toBe('Agendada');
  });

  it('enDesarrollo agrega idPedido a loadingIds durante la petición', () => {
    appointmentFacadeMock.updateState.mockReturnValue(of(mockAppointment()).pipe());
    let loadingDuringCall = false;
    appointmentFacadeMock.updateState.mockImplementation(() => {
      loadingDuringCall = component.loadingIds.includes(1);
      return of(mockAppointment({ estadoCita: 'EnProceso' }));
    });
    component.enDesarrollo(1);
    expect(loadingDuringCall).toBe(true);
  });

  it('enDesarrollo elimina idPedido de loadingIds al completar', () => {
    component.enDesarrollo(1);
    expect(component.loadingIds.includes(1)).toBe(false);
  });

  it('enDesarrollo no hace nada si la cita ya está en loadingIds', () => {
    component.loadingIds = [1];
    component.enDesarrollo(1);
    expect(appointmentFacadeMock.updateState).not.toHaveBeenCalled();
  });

  it('enDesarrollo revierte el estado a Agendada en caso de error', () => {
    component.appointments = [mockAppointmentSummary({ idPedido: 1, estadoCita: 'Agendada' })];
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));
    component.enDesarrollo(1);
    expect(component.appointments[0].estadoCita).toBe('Agendada');
  });

  it('enDesarrollo elimina idPedido de loadingIds en caso de error', () => {
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));
    component.enDesarrollo(1);
    expect(component.loadingIds.includes(1)).toBe(false);
  });

  it('enDesarrollo actualiza la cache con la cita actualizada', () => {
    const updated = mockAppointment({ estadoCita: 'EnProceso' });
    appointmentFacadeMock.updateState.mockReturnValue(of(updated));
    component.enDesarrollo(1);
    expect((component as any).appointmentCache.get(1)).toEqual(updated);
  });

  it('enDesarrollo actualiza selectedAppointment con datos del backend al completar', () => {
    const updated = mockAppointment({ idPedido: 1, estadoCita: 'EnProceso' });
    appointmentFacadeMock.updateState.mockReturnValue(of(updated));
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    component.enDesarrollo(1);
    expect(component.selectedAppointment).toEqual(updated);
  });

  // ─── terminado ────────────────────────────────────────────────

  it('terminado llama a updateState con Completada', () => {
    component.terminado(1);
    expect(appointmentFacadeMock.updateState).toHaveBeenCalledWith(1, 'Completada');
  });

  it('terminado hace optimistic update del estado en la lista', () => {
    appointmentFacadeMock.updateState.mockReturnValue(
      of(mockAppointment({ estadoCita: 'Completada' })),
    );
    component.appointments = [mockAppointmentSummary({ idPedido: 1, estadoCita: 'EnProceso' })];
    component.terminado(1);
    expect(component.appointments[0].estadoCita).toBe('Completada');
  });

  it('terminado actualiza selectedAppointment si está abierto', () => {
    appointmentFacadeMock.updateState.mockReturnValue(
      of(mockAppointment({ estadoCita: 'Completada' })),
    );
    component.selectedAppointment = mockAppointment({ idPedido: 1, estadoCita: 'EnProceso' });
    component.terminado(1);
    expect(component.selectedAppointment?.estadoCita).toBe('Completada');
  });

  it('terminado no hace nada si la cita ya está en loadingIds', () => {
    component.loadingIds = [1];
    component.terminado(1);
    expect(appointmentFacadeMock.updateState).not.toHaveBeenCalled();
  });

  it('terminado revierte al estado anterior en caso de error', () => {
    component.appointments = [mockAppointmentSummary({ idPedido: 1, estadoCita: 'EnProceso' })];
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));
    component.terminado(1);
    expect(component.appointments[0].estadoCita).toBe('EnProceso');
  });

  it('terminado revierte a EnProceso como fallback si no había estado previo', () => {
    component.appointments = [mockAppointmentSummary({ idPedido: 99, estadoCita: 'EnProceso' })];
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));
    component.terminado(99);
    expect(component.appointments[0].estadoCita).toBe('EnProceso');
  });

  it('terminado elimina idPedido de loadingIds al completar', () => {
    component.terminado(1);
    expect(component.loadingIds.includes(1)).toBe(false);
  });

  it('terminado elimina idPedido de loadingIds en caso de error', () => {
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));
    component.terminado(1);
    expect(component.loadingIds.includes(1)).toBe(false);
  });

  it('terminado actualiza la cache con la cita actualizada', () => {
    const updated = mockAppointment({ estadoCita: 'Completada' });
    appointmentFacadeMock.updateState.mockReturnValue(of(updated));
    component.terminado(1);
    expect((component as any).appointmentCache.get(1)).toEqual(updated);
  });

  // ─── getNombreMoto ────────────────────────────────────────────

  it('getNombreMoto retorna marca y modelo cuando existe la moto', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    expect(component.getNombreMoto(10)).toBe('Honda CB500');
  });

  it('getNombreMoto retorna — cuando no existe la moto', () => {
    component.motorbikesMap.clear();
    expect(component.getNombreMoto(99)).toBe('—');
  });

  // ─── getNombreServicio ────────────────────────────────────────

  it('getNombreServicio retorna el nombre cuando existe el servicio', () => {
    component.services = [mockService({ idServicio: 1, nombreServicio: 'Cambio de aceite' })];
    expect(component.getNombreServicio(1)).toBe('Cambio de aceite');
  });

  it('getNombreServicio retorna fallback cuando no existe el servicio', () => {
    component.services = [];
    expect(component.getNombreServicio(99)).toBe('Servicio #99');
  });

  // ─── getLabelEstado ───────────────────────────────────────────

  it('getLabelEstado retorna "En Proceso" para EnProceso', () => {
    expect(component.getLabelEstado('EnProceso')).toBe('En Proceso');
  });

  it('getLabelEstado retorna el mismo valor para otros estados', () => {
    expect(component.getLabelEstado('Agendada')).toBe('Agendada');
    expect(component.getLabelEstado('Completada')).toBe('Completada');
    expect(component.getLabelEstado('Todas')).toBe('Todas');
  });

  // ─── getIndiceCita ────────────────────────────────────────────

  it('getIndiceCita retorna la posición 1-based de la cita filtrada', () => {
    component.appointments = [
      mockAppointmentSummary({ idPedido: 1 }),
      mockAppointmentSummary({ idPedido: 2 }),
    ];
    component.filtroEstado = 'Todas';
    expect(component.getIndiceCita(1)).toBe(1);
    expect(component.getIndiceCita(2)).toBe(2);
  });

  it('getIndiceCita retorna 0 si la cita no está en la lista filtrada', () => {
    component.appointments = [mockAppointmentSummary({ idPedido: 1 })];
    expect(component.getIndiceCita(99)).toBe(0);
  });

  // ─── isLoading ────────────────────────────────────────────────

  it('isLoading retorna true si el id está en loadingIds', () => {
    component.loadingIds = [1, 2];
    expect(component.isLoading(1)).toBe(true);
  });

  it('isLoading retorna false si el id no está en loadingIds', () => {
    component.loadingIds = [];
    expect(component.isLoading(1)).toBe(false);
  });

  // ─── trackById ────────────────────────────────────────────────

  it('trackById retorna idPedido del item', () => {
    expect(component.trackById(0, mockAppointmentSummary({ idPedido: 7 }))).toBe(7);
  });

  // ─── HTML ─────────────────────────────────────────────────────

  it('muestra el título Citas Asignadas', () => {
    expectText('Citas Asignadas');
  });

  it('muestra los botones de filtro de estado', () => {
    expectText('Todas');
    expectText('Agendada');
    expectText('En Proceso');
    expectText('Completada');
  });

  it('muestra el nombre del cliente en la tabla', () => {
    expectText('Juan Pérez');
  });

  it('muestra el nombre de la moto en la tabla', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();
    expectText('Honda CB500');
  });

  it('muestra mensaje vacío cuando no hay citas filtradas', () => {
    component.appointments = [];
    fixture.detectChanges();
    expectText('No hay citas asignadas');
  });

  it('muestra badge de estado Agendada con clase correcta', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.estado-badge.agendada');
    expect(badge).not.toBeNull();
  });

  it('muestra badge de estado EnProceso con clase correcta', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'EnProceso' })];
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.estado-badge.en-proceso');
    expect(badge).not.toBeNull();
  });

  it('muestra badge de estado Completada con clase correcta', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Completada' })];
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.estado-badge.completada');
    expect(badge).not.toBeNull();
  });

  it('muestra botón "En Proceso" para citas Agendadas', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    fixture.detectChanges();
    expectText('En Proceso');
  });

  it('muestra botón "Terminado" para citas Agendadas', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    fixture.detectChanges();
    expectText('Terminado');
  });

  it('no muestra botón "En Proceso" para citas EnProceso', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'EnProceso' })];
    fixture.detectChanges();
    const btns = fixture.nativeElement.querySelectorAll('.btn-desarrollo');
    expect(btns.length).toBe(0);
  });

  it('muestra "—" para citas Completadas (sin acciones)', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Completada' })];
    fixture.detectChanges();
    const sinAccion = fixture.nativeElement.querySelector('.sin-accion');
    expect(sinAccion).not.toBeNull();
  });

  it('click en "En Proceso" llama a enDesarrollo', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'enDesarrollo');
    fixture.nativeElement.querySelector('.btn-desarrollo').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en "Terminado" llama a terminado', () => {
    component.appointments = [mockAppointmentSummary({ estadoCita: 'Agendada' })];
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'terminado');
    fixture.nativeElement.querySelector('.btn-terminado').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en "Ver" llama a openDetail', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'openDetail');
    fixture.nativeElement.querySelector('.btn-detalle').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en filtro "Agendada" llama a cambiarFiltro', () => {
    const spy = vi.spyOn(component, 'cambiarFiltro');
    const btns = fixture.nativeElement.querySelectorAll('.filtro-btn');
    // El orden es: Todas, Agendada, EnProceso, Completada
    btns[1].click();
    expect(spy).toHaveBeenCalledWith('Agendada');
  });

  it('botón de filtro activo tiene clase "activo"', () => {
    component.filtroEstado = 'Todas';
    fixture.detectChanges();
    const activeBtn = fixture.nativeElement.querySelector('.filtro-btn.activo');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn.textContent.trim()).toBe('Todas');
  });

  // ─── Panel de detalle ─────────────────────────────────────────

  it('panel de detalle se muestra cuando selectedAppointment está asignado', () => {
    component.selectedAppointment = mockAppointment();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.detail-panel.visible');
    expect(panel).not.toBeNull();
  });

  it('panel de detalle se muestra cuando loadingDetail es true', () => {
    component.loadingDetail = true;
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.detail-panel.visible');
    expect(panel).not.toBeNull();
  });

  it('panel de detalle está oculto cuando no hay cita seleccionada ni cargando', () => {
    component.selectedAppointment = null;
    component.loadingDetail = false;
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.detail-panel.visible');
    expect(panel).toBeNull();
  });

  it('muestra spinner de carga cuando loadingDetail es true', () => {
    component.loadingDetail = true;
    fixture.detectChanges();
    const loading = fixture.nativeElement.querySelector('.detail-loading');
    expect(loading).not.toBeNull();
  });

  it('muestra nombre del cliente en el panel de detalle', () => {
    component.selectedAppointment = mockAppointment({ nombreCliente: 'Ana García' });
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('Ana García');
  });

  it('muestra fecha y hora de la cita en el panel de detalle', () => {
    component.selectedAppointment = mockAppointment({ fechaCita: '2099-12-01', horaCita: '10:00' });
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('2099-12-01');
    expectText('10:00');
  });

  it('muestra el total en el panel de detalle', () => {
    component.selectedAppointment = mockAppointment({ total: 80000 });
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('80');
  });

  it('muestra los servicios del detalle usando getNombreServicio', () => {
    component.services = [mockService({ idServicio: 1, nombreServicio: 'Cambio de aceite' })];
    component.selectedAppointment = mockAppointment();
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('Cambio de aceite');
  });

  it('click en ✕ del panel llama a closeDetail', () => {
    component.selectedAppointment = mockAppointment();
    component.loadingDetail = false;
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'closeDetail');
    fixture.nativeElement.querySelector('.btn-close').click();
    expect(spy).toHaveBeenCalled();
  });

  it('muestra botón "Marcar En Proceso" en el panel cuando estado es Agendada', () => {
    component.selectedAppointment = mockAppointment({ estadoCita: 'Agendada' });
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('Marcar En Proceso');
  });

  it('muestra botón "Marcar Terminado" en el panel cuando estado es EnProceso', () => {
    component.selectedAppointment = mockAppointment({ estadoCita: 'EnProceso' });
    component.loadingDetail = false;
    fixture.detectChanges();
    expectText('Marcar Terminado');
  });

  it('no muestra acciones en el panel cuando estado es Completada', () => {
    component.selectedAppointment = mockAppointment({ estadoCita: 'Completada' });
    component.loadingDetail = false;
    fixture.detectChanges();
    const detailAcciones = fixture.nativeElement.querySelector('.detail-acciones');
    expect(detailAcciones).toBeNull();
  });

  it('botón "Marcar Terminado" del panel llama a terminado', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1, estadoCita: 'EnProceso' });
    component.loadingDetail = false;
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'terminado');
    fixture.nativeElement.querySelector('.btn-terminado.full-width').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('fila activa en tabla tiene clase row-active cuando coincide con selectedAppointment', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    fixture.detectChanges();
    const activeRow = fixture.nativeElement.querySelector('tr.row-active');
    expect(activeRow).not.toBeNull();
  });

  it('botón Ver tiene clase active cuando corresponde a la cita seleccionada', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-detalle.active');
    expect(btn).not.toBeNull();
  });

  it('tabla tiene clase panel-open cuando hay detalle abierto', () => {
    component.selectedAppointment = mockAppointment();
    fixture.detectChanges();
    const tableContainer = fixture.nativeElement.querySelector('.table-container.panel-open');
    expect(tableContainer).not.toBeNull();
  });
});
