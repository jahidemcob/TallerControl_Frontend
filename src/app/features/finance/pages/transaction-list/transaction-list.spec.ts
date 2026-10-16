import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionList } from './transaction-list';
import { FinanceFacade } from '../../services/finance.facade';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mocks base ───────────────────────────────────────────────────────────────

const mockMovimiento = (overrides = {}): any => ({
  idMovimiento: 1,
  descripcion: 'Pago proveedor',
  monto: 100000,
  tipoMovimiento: 'Egreso',
  fecha: '2024-06-01T10:00:00',
  ...overrides,
});

const mockSummary = (movimientos: any[] = [mockMovimiento()]): any => ({
  movimientos,
  total: movimientos.reduce(
    (acc: number, m: any) => (m.tipoMovimiento === 'Ingreso' ? acc + m.monto : acc - m.monto),
    0,
  ),
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('TransactionList', () => {
  let component: TransactionList;
  let fixture: ComponentFixture<TransactionList>;
  let facadeMock: any;

  async function createComponent(summaryOverride?: any) {
    if (summaryOverride !== undefined) {
      facadeMock.getMovimientos.mockReturnValue(summaryOverride);
    }

    fixture = TestBed.createComponent(TransactionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    facadeMock = {
      getMovimientos: vi.fn().mockReturnValue(of(mockSummary())),
      registrarIngreso: vi.fn().mockReturnValue(of(mockMovimiento({ tipoMovimiento: 'Ingreso' }))),
      registrarEgreso: vi.fn().mockReturnValue(of(mockMovimiento({ tipoMovimiento: 'Egreso' }))),
      mapBackendErrors: vi.fn().mockReturnValue({ general: 'Error del servidor' }),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionList],
      providers: [{ provide: FinanceFacade, useValue: facadeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  // ─── ngOnInit / cargarMovimientos ─────────────────────────────

  it('llama a cargarMovimientos en ngOnInit', () => {
    expect(facadeMock.getMovimientos).toHaveBeenCalled();
  });

  it('asigna summary correctamente al cargar', () => {
    expect(component.summary.movimientos).toHaveLength(1);
  });

  it('loading queda en false después de carga exitosa', () => {
    expect(component.loading).toBe(false);
  });

  it('error queda vacío después de carga exitosa', () => {
    expect(component.error).toBe('');
  });

  it('asigna error cuando cargarMovimientos falla', async () => {
    await createComponent(throwError(() => new Error('fail')));
    expect(component.error).toBe('Error al cargar los movimientos.');
  });

  it('loading queda en false cuando cargarMovimientos falla', async () => {
    await createComponent(throwError(() => new Error('fail')));
    expect(component.loading).toBe(false);
  });

  // ─── aplicarFiltro ────────────────────────────────────────────

  it('aplicarFiltro sin fecha copia todos los movimientos', () => {
    component.summary = mockSummary([mockMovimiento(), mockMovimiento({ idMovimiento: 2 })]);
    component.filtroFecha = '';
    component.aplicarFiltro();
    expect(component.movimientosFiltrados).toHaveLength(2);
  });

  it('aplicarFiltro con fecha filtra solo los movimientos de ese día', () => {
    component.summary = mockSummary([
      mockMovimiento({ fecha: '2024-06-01T08:00:00' }),
      mockMovimiento({ idMovimiento: 2, fecha: '2024-07-15T08:00:00' }),
    ]);
    component.filtroFecha = '2024-06-01';
    component.aplicarFiltro();
    expect(component.movimientosFiltrados).toHaveLength(1);
  });

  it('aplicarFiltro retorna vacío si no hay coincidencias de fecha', () => {
    component.summary = mockSummary([mockMovimiento({ fecha: '2024-06-01T00:00:00' })]);
    component.filtroFecha = '2099-01-01';
    component.aplicarFiltro();
    expect(component.movimientosFiltrados).toHaveLength(0);
  });

  // ─── limpiarFecha ─────────────────────────────────────────────

  it('limpiarFecha resetea filtroFecha a cadena vacía', () => {
    component.filtroFecha = '2024-06-01';
    component.limpiarFecha();
    expect(component.filtroFecha).toBe('');
  });

  it('limpiarFecha llama a aplicarFiltro y restaura movimientosFiltrados', () => {
    component.summary = mockSummary([mockMovimiento(), mockMovimiento({ idMovimiento: 2 })]);
    component.filtroFecha = '2024-06-01';
    component.aplicarFiltro();
    component.limpiarFecha();
    expect(component.movimientosFiltrados).toHaveLength(2);
  });

  // ─── totalFiltrado ────────────────────────────────────────────

  it('totalFiltrado suma Ingresos y resta Egresos', () => {
    component.movimientosFiltrados = [
      mockMovimiento({ tipoMovimiento: 'Ingreso', monto: 200000 }),
      mockMovimiento({ tipoMovimiento: 'Egreso', monto: 50000 }),
    ];
    expect(component.totalFiltrado).toBe(150000);
  });

  it('totalFiltrado retorna 0 con lista vacía', () => {
    component.movimientosFiltrados = [];
    expect(component.totalFiltrado).toBe(0);
  });

  it('totalFiltrado puede ser negativo con más Egresos', () => {
    component.movimientosFiltrados = [mockMovimiento({ tipoMovimiento: 'Egreso', monto: 300000 })];
    expect(component.totalFiltrado).toBe(-300000);
  });

  it('totalFiltrado es positivo con solo Ingresos', () => {
    component.movimientosFiltrados = [
      mockMovimiento({ tipoMovimiento: 'Ingreso', monto: 100000 }),
      mockMovimiento({ tipoMovimiento: 'Ingreso', monto: 50000 }),
    ];
    expect(component.totalFiltrado).toBe(150000);
  });

  // ─── submitCon ────────────────────────────────────────────────

  it('submitCon asigna tipoSeleccionado y llama a guardar', () => {
    const guardarSpy = vi.spyOn(component, 'guardar');
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.submitCon('Ingreso', form);
    expect(component.tipoSeleccionado).toBe('Ingreso');
    expect(guardarSpy).toHaveBeenCalledWith(form);
  });

  it('submitCon con Egreso asigna tipoSeleccionado Egreso', () => {
    const form = { invalid: true, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.submitCon('Egreso', form);
    expect(component.tipoSeleccionado).toBe('Egreso');
  });

  // ─── guardar ──────────────────────────────────────────────────

  it('guardar con form inválido no llama a facade', () => {
    const form = { invalid: true, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(facadeMock.registrarIngreso).not.toHaveBeenCalled();
    expect(facadeMock.registrarEgreso).not.toHaveBeenCalled();
  });

  it('guardar con form inválido marca todos los campos como touched', () => {
    const markSpy = vi.fn();
    const form = { invalid: true, control: { markAllAsTouched: markSpy }, resetForm: vi.fn() };
    component.guardar(form);
    expect(markSpy).toHaveBeenCalled();
  });

  it('guardar llama registrarIngreso cuando tipoSeleccionado es Ingreso', () => {
    facadeMock.getMovimientos.mockReturnValue(of(mockSummary()));
    component.descripcion = 'Venta';
    component.monto = 50000;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(facadeMock.registrarIngreso).toHaveBeenCalledWith('Venta', 50000);
  });

  it('guardar llama registrarEgreso cuando tipoSeleccionado es Egreso', () => {
    facadeMock.getMovimientos.mockReturnValue(of(mockSummary()));
    component.descripcion = 'Gasto';
    component.monto = 20000;
    component.tipoSeleccionado = 'Egreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(facadeMock.registrarEgreso).toHaveBeenCalledWith('Gasto', 20000);
  });

  it('guardar limpia descripcion y monto tras éxito', () => {
    facadeMock.getMovimientos.mockReturnValue(of(mockSummary()));
    component.descripcion = 'Prueba';
    component.monto = 1000;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(component.descripcion).toBe('');
    expect(component.monto).toBeNull();
  });

  it('guardar llama resetForm tras éxito', () => {
    facadeMock.getMovimientos.mockReturnValue(of(mockSummary()));
    component.descripcion = 'X';
    component.monto = 1;
    component.tipoSeleccionado = 'Ingreso';
    const resetSpy = vi.fn();
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: resetSpy };
    component.guardar(form);
    expect(resetSpy).toHaveBeenCalled();
  });

  it('guardar recarga movimientos tras éxito', () => {
    facadeMock.getMovimientos.mockReturnValue(of(mockSummary()));
    component.descripcion = 'Recarga';
    component.monto = 500;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    // getMovimientos: 1 del ngOnInit + 1 del reload post-guardar
    expect(facadeMock.getMovimientos).toHaveBeenCalledTimes(2);
  });

  it('guardar asigna errores cuando registrar falla', () => {
    facadeMock.registrarIngreso.mockReturnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.descripcion = 'Err';
    component.monto = 1;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(facadeMock.mapBackendErrors).toHaveBeenCalled();
    expect(component.errores).toEqual({ general: 'Error del servidor' });
  });

  it('guardar pone loading en false cuando registrar falla', () => {
    facadeMock.registrarIngreso.mockReturnValue(throwError(() => new Error('fail')));
    component.descripcion = 'Err';
    component.monto = 1;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(component.loading).toBe(false);
  });

  it('guardar asigna error cuando la recarga post-éxito falla', () => {
    facadeMock.registrarIngreso.mockReturnValue(of(mockMovimiento()));
    // Primero retorna éxito (para el guardar), luego error (para el reload)
    facadeMock.getMovimientos.mockReturnValueOnce(throwError(() => new Error('reload fail')));

    component.descripcion = 'X';
    component.monto = 1;
    component.tipoSeleccionado = 'Ingreso';
    const form = { invalid: false, control: { markAllAsTouched: vi.fn() }, resetForm: vi.fn() };
    component.guardar(form);
    expect(component.error).toBe('Error al cargar los movimientos.');
  });

  // ─── HTML ─────────────────────────────────────────────────────

  it('muestra el título Gestión de Finanzas', () => {
    expectText('Gestión de Finanzas');
  });

  it('muestra el título Movimientos', () => {
    expectText('Movimientos');
  });

  it('muestra la descripción del movimiento en la tabla', () => {
    expectText('Pago proveedor');
  });

  it('muestra mensaje vacío cuando no hay movimientos', async () => {
    await createComponent(of(mockSummary([])));
    expectText('No hay movimientos registrados.');
  });

  it('muestra Cargando... mientras loading es true', async () => {
    // Usamos un observable que no emite para mantener loading = true
    await createComponent(of(mockSummary()).pipe());
    component.loading = true;
    fixture.detectChanges();
    expectText('Cargando...');
  });

  it('muestra el error en el HTML cuando hay error de carga', async () => {
    await createComponent(throwError(() => new Error('fail')));
    expectText('Error al cargar los movimientos.');
  });

  it('muestra el tipo Egreso en la tabla', () => {
    expectText('Egreso');
  });

  it('renderiza una fila por cada movimiento filtrado', async () => {
    await createComponent(of(mockSummary([mockMovimiento(), mockMovimiento({ idMovimiento: 2 })])));
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    // Al menos 2 filas de datos
    const dataRows = Array.from(rows).filter((r: any) => !r.classList.contains('estado-celda'));
    expect(dataRows.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra el Total en la sección de totales', () => {
    expectText('Total:');
  });
});
