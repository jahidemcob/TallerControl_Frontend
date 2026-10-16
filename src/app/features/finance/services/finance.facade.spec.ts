import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FinanceFacade } from './finance.facade';
import { FinanceService } from './finance.service';
import { FinancesSummary, Movement } from '../models/finance.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FinanceFacade', () => {
  let facade: FinanceFacade;
  let serviceMock: any;

  // ─── helpers ──────────────────────────────────────────────────

  const mockMovimiento = (overrides = {}): Movement => ({
    idMovimiento: 1,
    descripcion: 'Test',
    monto: 50000,
    tipoMovimiento: 'Ingreso',
    fecha: new Date('2024-06-01T10:00:00'),
    ...overrides,
  });

  const mockSummary = (overrides = {}): FinancesSummary => ({
    movimientos: [mockMovimiento()],
    total: 50000,
    ...overrides,
  });

  beforeEach(() => {
    serviceMock = {
      getAll: vi.fn().mockReturnValue(of(mockSummary())),
      getById: vi.fn().mockReturnValue(of(mockMovimiento())),
      getByType: vi.fn().mockReturnValue(of(mockSummary())),
      create: vi.fn().mockReturnValue(of(mockMovimiento())),
    };

    TestBed.configureTestingModule({
      providers: [FinanceFacade, { provide: FinanceService, useValue: serviceMock }],
    });

    facade = TestBed.inject(FinanceFacade);
  });

  // ─── getMovimientos ───────────────────────────────────────────

  it('getMovimientos delega a service.getAll', () => {
    facade.getMovimientos().subscribe((res) => {
      expect(res).toEqual(mockSummary());
    });
    expect(serviceMock.getAll).toHaveBeenCalledTimes(1);
  });

  it('getMovimientos retorna el observable de getAll', () => {
    const result$ = facade.getMovimientos();
    result$.subscribe((res) => {
      expect(res.movimientos).toHaveLength(1);
    });
  });

  // ─── getMovimiento ────────────────────────────────────────────

  it('getMovimiento delega a service.getById con el id correcto', () => {
    facade.getMovimiento(7).subscribe((res) => {
      expect(res).toEqual(mockMovimiento());
    });
    expect(serviceMock.getById).toHaveBeenCalledWith(7);
  });

  it('getMovimiento retorna el observable de getById', () => {
    serviceMock.getById.mockReturnValue(of(mockMovimiento({ idMovimiento: 7 })));
    facade.getMovimiento(7).subscribe((res) => {
      expect(res.idMovimiento).toBe(7);
    });
  });

  // ─── getMovimientosPorTipo ────────────────────────────────────

  it('getMovimientosPorTipo delega a service.getByType con Ingreso', () => {
    facade.getMovimientosPorTipo('Ingreso').subscribe();
    expect(serviceMock.getByType).toHaveBeenCalledWith('Ingreso');
  });

  it('getMovimientosPorTipo delega a service.getByType con Egreso', () => {
    facade.getMovimientosPorTipo('Egreso').subscribe();
    expect(serviceMock.getByType).toHaveBeenCalledWith('Egreso');
  });

  it('getMovimientosPorTipo retorna el observable de getByType', () => {
    const summary = mockSummary({ total: -20000 });
    serviceMock.getByType.mockReturnValue(of(summary));
    facade.getMovimientosPorTipo('Egreso').subscribe((res) => {
      expect(res.total).toBe(-20000);
    });
  });

  // ─── registrarIngreso ─────────────────────────────────────────

  it('registrarIngreso llama a service.create con tipoMovimiento Ingreso', () => {
    facade.registrarIngreso('Venta', 100000).subscribe();
    expect(serviceMock.create).toHaveBeenCalledWith({
      tipoMovimiento: 'Ingreso',
      descripcion: 'Venta',
      monto: 100000,
    });
  });

  it('registrarIngreso retorna el observable de service.create', () => {
    const mov = mockMovimiento({ tipoMovimiento: 'Ingreso', monto: 100000 });
    serviceMock.create.mockReturnValue(of(mov));
    facade.registrarIngreso('Venta', 100000).subscribe((res) => {
      expect(res.tipoMovimiento).toBe('Ingreso');
      expect(res.monto).toBe(100000);
    });
  });

  it('registrarIngreso mapea correctamente descripcion y monto', () => {
    facade.registrarIngreso('Desc especial', 999).subscribe();
    const args = serviceMock.create.mock.calls[0][0];
    expect(args.descripcion).toBe('Desc especial');
    expect(args.monto).toBe(999);
  });

  // ─── registrarEgreso ──────────────────────────────────────────

  it('registrarEgreso llama a service.create con tipoMovimiento Egreso', () => {
    facade.registrarEgreso('Pago luz', 50000).subscribe();
    expect(serviceMock.create).toHaveBeenCalledWith({
      tipoMovimiento: 'Egreso',
      descripcion: 'Pago luz',
      monto: 50000,
    });
  });

  it('registrarEgreso retorna el observable de service.create', () => {
    const mov = mockMovimiento({ tipoMovimiento: 'Egreso', monto: 50000 });
    serviceMock.create.mockReturnValue(of(mov));
    facade.registrarEgreso('Pago luz', 50000).subscribe((res) => {
      expect(res.tipoMovimiento).toBe('Egreso');
    });
  });

  it('registrarEgreso mapea correctamente descripcion y monto', () => {
    facade.registrarEgreso('Otro gasto', 1234).subscribe();
    const args = serviceMock.create.mock.calls[0][0];
    expect(args.descripcion).toBe('Otro gasto');
    expect(args.monto).toBe(1234);
  });

  // ─── mapBackendErrors ─────────────────────────────────────────

  it('mapBackendErrors extrae message del error.error.message', () => {
    const err = { error: { message: 'Monto inválido' } };
    const result = facade.mapBackendErrors(err);
    expect(result.general).toBe('Monto inválido');
  });

  it('mapBackendErrors retorna Error desconocido si no hay message', () => {
    const err = { error: {} };
    const result = facade.mapBackendErrors(err);
    expect(result.general).toBe('Error desconocido');
  });

  it('mapBackendErrors retorna Error desconocido si error es null', () => {
    const result = facade.mapBackendErrors(null);
    expect(result.general).toBe('Error desconocido');
  });

  it('mapBackendErrors retorna Error desconocido si error es undefined', () => {
    const result = facade.mapBackendErrors(undefined);
    expect(result.general).toBe('Error desconocido');
  });

  it('mapBackendErrors retorna Error desconocido si no hay propiedad error', () => {
    const result = facade.mapBackendErrors({});
    expect(result.general).toBe('Error desconocido');
  });

  it('mapBackendErrors retorna objeto con solo la propiedad general', () => {
    const result = facade.mapBackendErrors({ error: { message: 'err' } });
    expect(Object.keys(result)).toContain('general');
  });
});
