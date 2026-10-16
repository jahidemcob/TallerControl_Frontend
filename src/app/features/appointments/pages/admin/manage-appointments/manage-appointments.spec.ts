import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAppointmentsComponent } from './manage-appointments';
import { AppointmentFacade } from '../../../services/appointment.facade';
import { UsuarioFacade } from '../../../../users/services/user.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mocks base ───────────────────────────────────────────────────────────────

const mockSummary = (overrides = {}): any => ({
  idPedido: 1,
  idMoto: 10,
  nombreCliente: 'Juan',
  estadoCita: 'Pendiente',
  fechaCita: '2024-06-01',
  horaCita: '10:00',
  total: 50000,
  ...overrides,
});

const mockAppointment = (overrides = {}): any => ({
  idPedido: 1,
  idMoto: 10,
  nombreCliente: 'Juan',
  estadoCita: 'Pendiente',
  fechaCita: '2024-06-01',
  horaCita: '10:00',
  fechaCreacionCita: '2024-05-01',
  total: 50000,
  detalles: [{ idServicio: 1, subTotal: 50000 }],
  ...overrides,
});

const mockMotorbike = (id = 10): any => ({
  idMoto: id,
  marca: 'Honda',
  modelo: 'CB500',
});

const mockEmployee = (overrides = {}): any => ({
  idUsuario: 5,
  nombre: 'Ana',
  correo: 'ana@mail.com',
  idRol: 2,
  activo: true,
  ...overrides,
});

const mockService = (overrides = {}): any => ({
  idServicio: 1,
  nombreServicio: 'Cambio de aceite',
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ManageAppointmentsComponent', () => {
  let component: ManageAppointmentsComponent;
  let fixture: ComponentFixture<ManageAppointmentsComponent>;
  let appointmentFacadeMock: any;
  let usuarioFacadeMock: any;
  let motorbikeFacadeMock: any;
  let servicesFacadeMock: any;

  beforeEach(async () => {
    appointmentFacadeMock = {
      getAll: vi.fn().mockReturnValue(of([])),
      getById: vi.fn().mockReturnValue(of(mockAppointment())),
      assignEmployee: vi.fn().mockReturnValue(of(mockAppointment({ estadoCita: 'Agendada' }))),
      updateState: vi.fn().mockReturnValue(of(mockAppointment({ estadoCita: 'Rechazada' }))),
    };

    usuarioFacadeMock = {
      getUsuarios: vi.fn().mockReturnValue(of([mockEmployee()])),
    };

    motorbikeFacadeMock = {
      getMotorbikeById: vi.fn().mockReturnValue(of(mockMotorbike())),
    };

    servicesFacadeMock = {
      getServicios: vi.fn().mockReturnValue(of([mockService()])),
    };

    await TestBed.configureTestingModule({
      imports: [ManageAppointmentsComponent],
      providers: [
        { provide: AppointmentFacade, useValue: appointmentFacadeMock },
        { provide: UsuarioFacade, useValue: usuarioFacadeMock },
        { provide: MotorbikeFacade, useValue: motorbikeFacadeMock },
        { provide: ServicesFacade, useValue: servicesFacadeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── helpers ─────────────────────────────────────────────────

  function loadAppointments(appointments: any[]) {
    appointmentFacadeMock.getAll.mockReturnValue(of(appointments));
    component.loadAppointments();
    fixture.detectChanges();
  }

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  // ─── ngOnInit ────────────────────────────────────────────────

  it('carga servicios en ngOnInit', () => {
    expect(servicesFacadeMock.getServicios).toHaveBeenCalled();
    expect(component.services).toHaveLength(1);
  });

  it('carga citas en ngOnInit', () => {
    expect(appointmentFacadeMock.getAll).toHaveBeenCalled();
  });

  // ─── loadAppointments ─────────────────────────────────────────

  it('loadAppointments llena el array de appointments', () => {
    loadAppointments([mockSummary()]);
    expect(component.appointments).toHaveLength(1);
  });

  it('loadAppointments llama a getMotorbikeById para ids nuevos', () => {
    loadAppointments([mockSummary({ idMoto: 10 })]);
    expect(motorbikeFacadeMock.getMotorbikeById).toHaveBeenCalledWith(10);
  });

  it('loadAppointments no repite llamadas para motos ya en cache', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    loadAppointments([mockSummary({ idMoto: 10 })]);
    // El id ya está en cache, no debe hacer ninguna llamada
    expect(motorbikeFacadeMock.getMotorbikeById).toHaveBeenCalledTimes(0);
  });

  it('loadAppointments maneja error silenciosamente', () => {
    appointmentFacadeMock.getAll.mockReturnValue(throwError(() => new Error('fail')));
    expect(() => component.loadAppointments()).not.toThrow();
  });

  it('loadAppointments deduplica ids de motos', () => {
    loadAppointments([
      mockSummary({ idPedido: 1, idMoto: 10 }),
      mockSummary({ idPedido: 2, idMoto: 10 }),
    ]);
    // Solo una llamada por id único
    const calls = motorbikeFacadeMock.getMotorbikeById.mock.calls.filter(
      ([id]: [number]) => id === 10,
    );
    expect(calls.length).toBe(1);
  });

  // ─── appointmentsFiltradas ────────────────────────────────────

  it('appointmentsFiltradas retorna todas cuando filtro es Todas', () => {
    component.appointments = [
      mockSummary({ estadoCita: 'Pendiente' }),
      mockSummary({ idPedido: 2, estadoCita: 'Agendada' }),
    ];
    component.filtroEstado = 'Todas';
    expect(component.appointmentsFiltradas).toHaveLength(2);
  });

  it('appointmentsFiltradas filtra por estado', () => {
    component.appointments = [
      mockSummary({ estadoCita: 'Pendiente' }),
      mockSummary({ idPedido: 2, estadoCita: 'Agendada' }),
    ];
    component.filtroEstado = 'Pendiente';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].estadoCita).toBe('Pendiente');
  });

  it('appointmentsFiltradas filtra por fecha', () => {
    component.appointments = [
      mockSummary({ fechaCita: '2024-06-01' }),
      mockSummary({ idPedido: 2, fechaCita: '2024-07-01' }),
    ];
    component.filtroFecha = '2024-06-01';
    expect(component.appointmentsFiltradas).toHaveLength(1);
  });

  it('appointmentsFiltradas combina filtro de estado y fecha', () => {
    component.appointments = [
      mockSummary({ estadoCita: 'Pendiente', fechaCita: '2024-06-01' }),
      mockSummary({ idPedido: 2, estadoCita: 'Agendada', fechaCita: '2024-06-01' }),
      mockSummary({ idPedido: 3, estadoCita: 'Pendiente', fechaCita: '2024-07-01' }),
    ];
    component.filtroEstado = 'Pendiente';
    component.filtroFecha = '2024-06-01';
    expect(component.appointmentsFiltradas).toHaveLength(1);
  });

  // ─── cambiarFiltro ────────────────────────────────────────────

  it('cambiarFiltro actualiza filtroEstado', () => {
    component.cambiarFiltro('Agendada');
    expect(component.filtroEstado).toBe('Agendada');
  });

  it('cambiarFiltro cierra el detalle si estaba abierto', () => {
    component.selectedAppointment = mockAppointment();
    component.cambiarFiltro('Completada');
    expect(component.selectedAppointment).toBeNull();
  });

  // ─── limpiarFecha ─────────────────────────────────────────────

  it('limpiarFecha vacía filtroFecha', () => {
    component.filtroFecha = '2024-06-01';
    component.limpiarFecha();
    expect(component.filtroFecha).toBe('');
  });

  // ─── openDetail / closeDetail ─────────────────────────────────

  it('openDetail carga el detalle de la cita', () => {
    appointmentFacadeMock.getById.mockReturnValue(of(mockAppointment()));
    component.appointments = [mockSummary()];
    component.openDetail(1);
    expect(appointmentFacadeMock.getById).toHaveBeenCalledWith(1);
    expect(component.selectedAppointment?.idPedido).toBe(1);
    expect(component.loadingDetail).toBe(false);
  });

  it('openDetail usa caché si la cita ya fue cargada', () => {
    const cached = mockAppointment({ idPedido: 1 });
    component['appointmentCache'].set(1, cached);
    component.openDetail(1);
    expect(appointmentFacadeMock.getById).not.toHaveBeenCalled();
    expect(component.selectedAppointment).toEqual(cached);
  });

  it('openDetail cierra detalle si se hace click en la misma cita', () => {
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    component.openDetail(1);
    expect(component.selectedAppointment).toBeNull();
  });

  it('openDetail maneja error y resetea loadingDetail', () => {
    appointmentFacadeMock.getById.mockReturnValue(throwError(() => new Error('fail')));
    component.appointments = [mockSummary()];
    component.openDetail(1);
    expect(component.loadingDetail).toBe(false);
  });

  it('closeDetail limpia el selectedAppointment', () => {
    component.selectedAppointment = mockAppointment();
    component.closeDetail();
    expect(component.selectedAppointment).toBeNull();
    expect(component.loadingDetail).toBe(false);
  });

  // ─── abrirAsignar / cerrarAsignar ─────────────────────────────

  it('abrirAsignar pone assigningId y carga empleados', () => {
    component.abrirAsignar(1);
    expect(component.assigningId).toBe(1);
    expect(component.employees).toHaveLength(1);
    expect(component.loadingEmployees).toBe(false);
  });

  it('abrirAsignar filtra solo empleados activos con idRol 2', () => {
    usuarioFacadeMock.getUsuarios.mockReturnValue(
      of([
        mockEmployee({ idRol: 2, activo: true }),
        mockEmployee({ idUsuario: 6, idRol: 1, activo: true }), // admin, excluir
        mockEmployee({ idUsuario: 7, idRol: 2, activo: false }), // inactivo, excluir
      ]),
    );
    component.abrirAsignar(1);
    expect(component.employees).toHaveLength(1);
    expect(component.employees[0].idUsuario).toBe(5);
  });

  it('abrirAsignar maneja error al cargar empleados', () => {
    usuarioFacadeMock.getUsuarios.mockReturnValue(throwError(() => new Error('fail')));
    component.abrirAsignar(1);
    expect(component.loadingEmployees).toBe(false);
  });

  it('cerrarAsignar limpia assigningId y selectedEmployeeId', () => {
    component.assigningId = 1;
    component.selectedEmployeeId = 5;
    component.cerrarAsignar();
    expect(component.assigningId).toBeNull();
    expect(component.selectedEmployeeId).toBeNull();
  });

  // ─── confirmarAsignar ─────────────────────────────────────────

  it('confirmarAsignar no hace nada si no hay assigningId o selectedEmployeeId', () => {
    component.assigningId = null;
    component.selectedEmployeeId = null;
    component.confirmarAsignar();
    expect(appointmentFacadeMock.assignEmployee).not.toHaveBeenCalled();
  });

  it('confirmarAsignar llama a assignEmployee y actualiza appointments', () => {
    component.appointments = [mockSummary()];
    component.assigningId = 1;
    component.selectedEmployeeId = 5;
    component.employees = [mockEmployee()];

    const updated = mockAppointment({ estadoCita: 'Agendada', nombreEmpleado: 'Ana' });
    appointmentFacadeMock.assignEmployee.mockReturnValue(of(updated));

    component.confirmarAsignar();

    expect(appointmentFacadeMock.assignEmployee).toHaveBeenCalledWith(1, { idUsuario: 5 });
    expect(component.appointments[0].estadoCita).toBe('Agendada');
    expect(component.loadingIds).not.toContain(1);
  });

  it('confirmarAsignar actualiza selectedAppointment si estaba abierto', () => {
    component.appointments = [mockSummary()];
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    component.assigningId = 1;
    component.selectedEmployeeId = 5;
    component.employees = [mockEmployee()];

    const updated = mockAppointment({ idPedido: 1, estadoCita: 'Agendada', nombreEmpleado: 'Ana' });
    appointmentFacadeMock.assignEmployee.mockReturnValue(of(updated));

    component.confirmarAsignar();

    expect(component.selectedAppointment?.estadoCita).toBe('Agendada');
  });

  it('confirmarAsignar revierte optimistic update en error', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];
    component.assigningId = 1;
    component.selectedEmployeeId = 5;
    component.employees = [mockEmployee()];

    appointmentFacadeMock.assignEmployee.mockReturnValue(throwError(() => new Error('fail')));

    component.confirmarAsignar();

    expect(component.appointments[0].estadoCita).toBe('Pendiente');
    expect(component.loadingIds).not.toContain(1);
  });

  it('confirmarAsignar cierra detalle en error si era la cita abierta', () => {
    component.appointments = [mockSummary()];
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    component.assigningId = 1;
    component.selectedEmployeeId = 5;
    component.employees = [mockEmployee()];

    appointmentFacadeMock.assignEmployee.mockReturnValue(throwError(() => new Error('fail')));

    component.confirmarAsignar();

    expect(component.selectedAppointment).toBeNull();
  });

  // ─── rechazar ─────────────────────────────────────────────────

  it('rechazar hace update optimista y llama a updateState', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];

    const updated = mockAppointment({ estadoCita: 'Rechazada' });
    appointmentFacadeMock.updateState.mockReturnValue(of(updated));

    component.rechazar(1);

    expect(appointmentFacadeMock.updateState).toHaveBeenCalledWith(1, 'Rechazada');
    expect(component.appointments[0].estadoCita).toBe('Rechazada');
    expect(component.loadingIds).not.toContain(1);
  });

  it('rechazar no hace nada si la cita está en loadingIds', () => {
    component.loadingIds = [1];
    component.rechazar(1);
    expect(appointmentFacadeMock.updateState).not.toHaveBeenCalled();
  });

  it('rechazar revierte estado en error', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];
    appointmentFacadeMock.updateState.mockReturnValue(throwError(() => new Error('fail')));

    component.rechazar(1);

    expect(component.appointments[0].estadoCita).toBe('Pendiente');
  });

  it('rechazar cierra detalle si era la cita abierta', () => {
    component.appointments = [mockSummary()];
    component.selectedAppointment = mockAppointment({ idPedido: 1 });
    appointmentFacadeMock.updateState.mockReturnValue(
      of(mockAppointment({ estadoCita: 'Rechazada' })),
    );

    component.rechazar(1);

    expect(component.selectedAppointment).toBeNull();
  });

  // ─── getNombreMoto / getNombreServicio ────────────────────────

  it('getNombreMoto retorna marca + modelo si existe', () => {
    component.motorbikesMap.set(10, mockMotorbike());
    expect(component.getNombreMoto(10)).toBe('Honda CB500');
  });

  it('getNombreMoto retorna — si no existe', () => {
    expect(component.getNombreMoto(999)).toBe('—');
  });

  it('getNombreServicio retorna nombre del servicio si existe', () => {
    component.services = [mockService()];
    expect(component.getNombreServicio(1)).toBe('Cambio de aceite');
  });

  it('getNombreServicio retorna fallback si no existe', () => {
    component.services = [];
    expect(component.getNombreServicio(99)).toBe('Servicio #99');
  });

  // ─── getLabelEstado ───────────────────────────────────────────

  it('getLabelEstado convierte EnProceso a En Proceso', () => {
    expect(component.getLabelEstado('EnProceso')).toBe('En Proceso');
  });

  it('getLabelEstado retorna otros estados sin cambios', () => {
    expect(component.getLabelEstado('Pendiente')).toBe('Pendiente');
    expect(component.getLabelEstado('Agendada')).toBe('Agendada');
    expect(component.getLabelEstado('Completada')).toBe('Completada');
    expect(component.getLabelEstado('Rechazada')).toBe('Rechazada');
    expect(component.getLabelEstado('Todas')).toBe('Todas');
  });

  // ─── isLoading ────────────────────────────────────────────────

  it('isLoading retorna true si el id está en loadingIds', () => {
    component.loadingIds = [1, 2];
    expect(component.isLoading(1)).toBe(true);
  });

  it('isLoading retorna false si el id no está en loadingIds', () => {
    component.loadingIds = [];
    expect(component.isLoading(99)).toBe(false);
  });

  // ─── trackById ────────────────────────────────────────────────

  it('trackById retorna idPedido del item', () => {
    expect(component.trackById(0, mockSummary({ idPedido: 42 }))).toBe(42);
  });

  // ─── HTML ─────────────────────────────────────────────────────

  it('muestra mensaje cuando no hay citas', () => {
    component.appointments = [];
    fixture.detectChanges();
    expectText('No hay citas registradas');
  });

  it('renderiza fila por cada cita filtrada', () => {
    component.appointments = [mockSummary({ idPedido: 1 }), mockSummary({ idPedido: 2 })];
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr:not(.empty-row)');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra botones Aceptar y Rechazar para citas Pendiente', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();
    expectText('Aceptar');
    expectText('Rechazar');
  });

  it('muestra — cuando la cita no está Pendiente', () => {
    component.appointments = [mockSummary({ estadoCita: 'Agendada' })];
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();
    const sinAccion = fixture.nativeElement.querySelectorAll('.sin-accion');
    expect(sinAccion.length).toBeGreaterThan(0);
  });

  it('muestra el panel de detalle cuando hay selectedAppointment', () => {
    component.selectedAppointment = mockAppointment();
    component.services = [mockService()];
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();
    expectText('Juan');
    expectText('Honda CB500');
  });

  it('muestra todos los filtros de estado en el HTML', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pendiente');
    expect(text).toContain('Agendada');
    expect(text).toContain('En Proceso');
    expect(text).toContain('Completada');
    expect(text).toContain('Rechazada');
    expect(text).toContain('Todas');
  });

  it('muestra modal de asignar empleado cuando assigningId no es null', () => {
    component.assigningId = 1;
    component.employees = [mockEmployee()];
    component.loadingEmployees = false;
    fixture.detectChanges();
    expectText('Asignar Empleado');
    expectText('Ana');
  });

  it('muestra mensaje de no empleados disponibles cuando lista está vacía', () => {
    component.assigningId = 1;
    component.employees = [];
    component.loadingEmployees = false;
    fixture.detectChanges();
    expectText('No hay empleados disponibles');
  });

  it('btn-confirmar está deshabilitado sin empleado seleccionado', () => {
    component.assigningId = 1;
    component.employees = [mockEmployee()];
    component.loadingEmployees = false;
    component.selectedEmployeeId = null;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-confirmar');
    expect(btn.disabled).toBe(true);
  });

  it('btn-confirmar está habilitado con empleado seleccionado', () => {
    component.assigningId = 1;
    component.employees = [mockEmployee()];
    component.loadingEmployees = false;
    component.selectedEmployeeId = 5;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-confirmar');
    expect(btn.disabled).toBe(false);
  });

  it('click en Cancelar del modal llama a cerrarAsignar', () => {
    component.assigningId = 1;
    component.employees = [];
    component.loadingEmployees = false;
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'cerrarAsignar');
    fixture.nativeElement.querySelector('.btn-cancelar').click();
    expect(spy).toHaveBeenCalled();
  });

  it('click en btn-detalle llama a openDetail', () => {
    component.appointments = [mockSummary()];
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'openDetail');
    fixture.nativeElement.querySelector('.btn-detalle').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en Rechazar llama a rechazar', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];
    component.motorbikesMap.set(10, mockMotorbike());
    appointmentFacadeMock.updateState.mockReturnValue(
      of(mockAppointment({ estadoCita: 'Rechazada' })),
    );
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'rechazar');
    fixture.nativeElement.querySelector('.btn-rechazar').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en Aceptar llama a abrirAsignar', () => {
    component.appointments = [mockSummary({ estadoCita: 'Pendiente' })];
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'abrirAsignar');
    fixture.nativeElement.querySelector('.btn-aceptar').click();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('click en ✕ del detalle llama a closeDetail', () => {
    component.selectedAppointment = mockAppointment();
    component.motorbikesMap.set(10, mockMotorbike());
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'closeDetail');
    fixture.nativeElement.querySelector('.btn-close').click();
    expect(spy).toHaveBeenCalled();
  });
});
