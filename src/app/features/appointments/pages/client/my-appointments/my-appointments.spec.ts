import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAppointmentsComponent } from './my-appointments';
import { AppointmentFacade } from '../../../services/appointment.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mocks base ───────────────────────────────────────────────────────────────

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

const mockMotorbike = (overrides = {}): any => ({
  idMoto: 10,
  marca: 'Honda',
  modelo: 'CB500',
  activo: true,
  ...overrides,
});

const mockService = (overrides = {}): any => ({
  idServicio: 1,
  nombreServicio: 'Cambio de aceite',
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('MyAppointmentsComponent', () => {
  let component: MyAppointmentsComponent;
  let fixture: ComponentFixture<MyAppointmentsComponent>;
  let appointmentFacadeMock: any;
  let motorbikeFacadeMock: any;
  let servicesFacadeMock: any;
  let routerMock: any;

  // ✅ Recrea el fixture con los mocks que necesites ANTES de que ngOnInit corra.
  // Esto evita mutar propiedades después de la inicialización (causa raíz del NG0100).
  async function createComponent(
    appointmentOverride?: any,
    motorbikeOverride?: any,
    serviceOverride?: any,
  ) {
    if (appointmentOverride) {
      appointmentFacadeMock.getByUserFull.mockReturnValue(appointmentOverride);
    }
    if (motorbikeOverride) {
      motorbikeFacadeMock.getMotorbikes.mockReturnValue(motorbikeOverride);
    }
    if (serviceOverride) {
      servicesFacadeMock.getServicios.mockReturnValue(serviceOverride);
    }

    fixture = TestBed.createComponent(MyAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit con los mocks ya configurados
    return { fixture, component };
  }

  beforeEach(async () => {
    appointmentFacadeMock = {
      getByUserFull: vi.fn().mockReturnValue(of([mockAppointment()])),
    };

    motorbikeFacadeMock = {
      getMotorbikes: vi.fn().mockReturnValue(of([mockMotorbike()])),
    };

    servicesFacadeMock = {
      getServicios: vi.fn().mockReturnValue(of([mockService()])),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MyAppointmentsComponent],
      providers: [
        { provide: AppointmentFacade, useValue: appointmentFacadeMock },
        { provide: MotorbikeFacade, useValue: motorbikeFacadeMock },
        { provide: ServicesFacade, useValue: servicesFacadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── helpers ──────────────────────────────────────────────────

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  // ─── ngOnInit ─────────────────────────────────────────────────

  it('carga motos y servicios en ngOnInit con forkJoin', () => {
    expect(motorbikeFacadeMock.getMotorbikes).toHaveBeenCalled();
    expect(servicesFacadeMock.getServicios).toHaveBeenCalled();
    expect(component.motorbikes).toHaveLength(1);
    expect(component.services).toHaveLength(1);
  });

  it('llama a loadAppointments después de forkJoin exitoso', () => {
    expect(appointmentFacadeMock.getByUserFull).toHaveBeenCalled();
    expect(component.appointments).toHaveLength(1);
  });

  it('muestra errorMsg cuando forkJoin falla', async () => {
    // ✅ Configuramos el mock ANTES de crear el componente, ngOnInit lo usa directamente
    await createComponent(
      undefined,
      throwError(() => new Error('fail')),
    );
    expect(component.errorMsg).toBe('No se pudieron cargar los datos. Intenta de nuevo.');
  });

  // ─── loadAppointments ─────────────────────────────────────────

  it('loadAppointments llena el array de appointments', () => {
    appointmentFacadeMock.getByUserFull.mockReturnValue(
      of([mockAppointment({ idPedido: 1 }), mockAppointment({ idPedido: 2 })]),
    );
    component.loadAppointments();
    expect(component.appointments).toHaveLength(2);
  });

  it('loadAppointments limpia errorMsg en éxito', () => {
    component.errorMsg = 'error previo';
    appointmentFacadeMock.getByUserFull.mockReturnValue(of([]));
    component.loadAppointments();
    expect(component.errorMsg).toBe('');
  });

  it('loadAppointments asigna errorMsg en error', () => {
    appointmentFacadeMock.getByUserFull.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAppointments();
    expect(component.errorMsg).toBe('No se pudieron cargar las citas. Intenta de nuevo.');
  });

  // ─── appointmentsFiltradas ────────────────────────────────────

  it('appointmentsFiltradas retorna todas cuando filtro es Todas', () => {
    component.appointments = [
      mockAppointment({ estadoCita: 'Pendiente' }),
      mockAppointment({ idPedido: 2, estadoCita: 'Agendada' }),
    ];
    component.filtroEstado = 'Todas';
    expect(component.appointmentsFiltradas).toHaveLength(2);
  });

  it('appointmentsFiltradas filtra por estado Pendiente', () => {
    component.appointments = [
      mockAppointment({ estadoCita: 'Pendiente' }),
      mockAppointment({ idPedido: 2, estadoCita: 'Agendada' }),
    ];
    component.filtroEstado = 'Pendiente';
    expect(component.appointmentsFiltradas).toHaveLength(1);
    expect(component.appointmentsFiltradas[0].estadoCita).toBe('Pendiente');
  });

  it('appointmentsFiltradas retorna vacío si no hay coincidencias', () => {
    component.appointments = [mockAppointment({ estadoCita: 'Pendiente' })];
    component.filtroEstado = 'Completada';
    expect(component.appointmentsFiltradas).toHaveLength(0);
  });

  it('appointmentsFiltradas filtra por EnProceso', () => {
    component.appointments = [
      mockAppointment({ estadoCita: 'EnProceso' }),
      mockAppointment({ idPedido: 2, estadoCita: 'Pendiente' }),
    ];
    component.filtroEstado = 'EnProceso';
    expect(component.appointmentsFiltradas).toHaveLength(1);
  });

  // ─── getIdVisual ──────────────────────────────────────────────

  it('getIdVisual retorna posición basada en 1 para la primera cita', () => {
    component.appointments = [mockAppointment({ idPedido: 1 })];
    expect(component.getIdVisual(1)).toBe(1);
  });

  it('getIdVisual retorna posición correcta para citas múltiples', () => {
    component.appointments = [
      mockAppointment({ idPedido: 10 }),
      mockAppointment({ idPedido: 20 }),
      mockAppointment({ idPedido: 30 }),
    ];
    expect(component.getIdVisual(10)).toBe(1);
    expect(component.getIdVisual(20)).toBe(2);
    expect(component.getIdVisual(30)).toBe(3);
  });

  it('getIdVisual retorna 1 si idPedido no existe', () => {
    component.appointments = [];
    expect(component.getIdVisual(999)).toBe(1);
  });

  // ─── cambiarFiltro ────────────────────────────────────────────

  it('cambiarFiltro actualiza filtroEstado', () => {
    component.cambiarFiltro('Agendada');
    expect(component.filtroEstado).toBe('Agendada');
  });

  it('cambiarFiltro puede volver a Todas', () => {
    component.filtroEstado = 'Pendiente';
    component.cambiarFiltro('Todas');
    expect(component.filtroEstado).toBe('Todas');
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

  // ─── getNombreMoto ────────────────────────────────────────────

  it('getNombreMoto retorna marca + modelo si existe', () => {
    component.motorbikes = [mockMotorbike()];
    expect(component.getNombreMoto(10)).toBe('Honda CB500');
  });

  it('getNombreMoto retorna fallback si no existe', () => {
    component.motorbikes = [];
    expect(component.getNombreMoto(99)).toBe('Moto #99');
  });

  // ─── getNombreServicio ────────────────────────────────────────

  it('getNombreServicio retorna nombre del servicio si existe', () => {
    component.services = [mockService()];
    expect(component.getNombreServicio(1)).toBe('Cambio de aceite');
  });

  it('getNombreServicio retorna fallback si no existe', () => {
    component.services = [];
    expect(component.getNombreServicio(99)).toBe('Servicio #99');
  });

  // ─── solicitarCita ────────────────────────────────────────────

  it('solicitarCita navega a /cliente/citas/solicitar', () => {
    component.solicitarCita();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/citas/solicitar']);
  });

  // ─── trackById ────────────────────────────────────────────────

  it('trackById retorna idPedido del item', () => {
    expect(component.trackById(0, mockAppointment({ idPedido: 42 }))).toBe(42);
  });

  // ─── HTML ─────────────────────────────────────────────────────

  it('muestra el título Mis Citas', () => {
    expectText('Mis Citas');
  });

  it('muestra botón Solicitar Cita', () => {
    expectText('+ Solicitar Cita');
  });

  // ✅ Usamos createComponent para que el estado vacío llegue DESDE ngOnInit, no como mutación posterior
  it('muestra mensaje cuando no hay citas filtradas', async () => {
    await createComponent(of([]));
    expectText('No tienes citas registradas');
  });

  // ✅ Mismo patrón: datos configurados antes del ngOnInit
  it('renderiza fila por cada cita filtrada', async () => {
    await createComponent(of([mockAppointment({ idPedido: 1 }), mockAppointment({ idPedido: 2 })]));
    const rows = fixture.nativeElement.querySelectorAll('tbody tr:not(.empty-row)');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra todos los filtros de estado', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Todas');
    expect(text).toContain('Pendiente');
    expect(text).toContain('Agendada');
    expect(text).toContain('En Proceso');
    expect(text).toContain('Completada');
    expect(text).toContain('Rechazada');
  });

  // ✅ errorMsg se valida a nivel lógico; la vista HTML se valida indirectamente
  // con el test de forkJoin falla que ya recrea el componente limpio
  it('muestra errorMsg en el HTML cuando está seteado', async () => {
    await createComponent(
      undefined,
      throwError(() => new Error('fail')),
    );
    expectText('No se pudieron cargar los datos. Intenta de nuevo.');
  });

  it('no muestra errorMsg en el HTML cuando está vacío', () => {
    // El beforeEach ya arranca con éxito → errorMsg = ''
    const errorEl = fixture.nativeElement.querySelector('.error-msg');
    expect(errorEl).toBeNull();
  });

  it('muestra el nombre de la moto en la tabla', () => {
    // El beforeEach ya carga mockMotorbike() + mockAppointment() → Honda CB500 visible
    expectText('Honda CB500');
  });

  it('muestra el nombre del servicio en la tabla', () => {
    // El beforeEach ya carga mockService() + mockAppointment() → Cambio de aceite visible
    expectText('Cambio de aceite');
  });

  it('click en filtro llama cambiarFiltro', () => {
    const spy = vi.spyOn(component, 'cambiarFiltro');
    const botones = fixture.nativeElement.querySelectorAll('.filtro-btn');
    botones[1].click();
    expect(spy).toHaveBeenCalledWith('Pendiente');
  });

  it('click en Solicitar Cita llama solicitarCita', () => {
    const spy = vi.spyOn(component, 'solicitarCita');
    fixture.nativeElement.querySelector('.btn-create').click();
    expect(spy).toHaveBeenCalled();
  });

  it('aplica clase activo al filtro seleccionado', () => {
    // filtroEstado arranca en 'Todas' por defecto → primer botón debe tener clase activo
    const botones = fixture.nativeElement.querySelectorAll('.filtro-btn');
    expect(botones[0].classList.contains('activo')).toBe(true);
    expect(botones[1].classList.contains('activo')).toBe(false);
  });

  // ✅ Datos configurados antes del ngOnInit para evitar mutación post-init
  it('muestra — cuando la cita no tiene detalles', async () => {
    await createComponent(of([mockAppointment({ detalles: [] })]));
    expectText('—');
  });
});
