import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FinanceService } from './finance.service';
import { environment } from '../../../../environments/environment';
import { CreateMovement, FinancesSummary, Movement } from '../models/finance.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('FinanceService', () => {
  let service: FinanceService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/Finances`;

  const mockMovimiento = (overrides = {}): Movement => ({
    idMovimiento: 1,
    descripcion: 'Pago proveedor',
    monto: 100000,
    tipoMovimiento: 'Egreso',
    fecha: new Date('2024-06-01T10:00:00'),
    ...overrides,
  });

  const mockSummary = (overrides = {}): FinancesSummary => ({
    movimientos: [mockMovimiento()],
    total: -100000,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FinanceService],
    });

    service = TestBed.inject(FinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── getAll ───────────────────────────────────────────────────

  it('getAll debería hacer GET a la URL base y retornar FinancesSummary', () => {
    const mock = mockSummary();

    service.getAll().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getAll debería retornar un summary con movimientos vacíos', () => {
    const mock = mockSummary({ movimientos: [], total: 0 });

    service.getAll().subscribe((res) => {
      expect(res.movimientos).toHaveLength(0);
      expect(res.total).toBe(0);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush(mock);
  });

  // ─── getById ──────────────────────────────────────────────────

  it('getById debería hacer GET a /:id y retornar el movimiento', () => {
    const mock = mockMovimiento({ idMovimiento: 5 });

    service.getById(5).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById debería construir la URL correctamente con distintos ids', () => {
    service.getById(99).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/99`);
    expect(req.request.url).toContain('/99');
    req.flush(mockMovimiento({ idMovimiento: 99 }));
  });

  // ─── getByType ────────────────────────────────────────────────

  it('getByType debería hacer GET a /type/Ingreso', () => {
    const mock = mockSummary({ movimientos: [mockMovimiento({ tipoMovimiento: 'Ingreso' })] });

    service.getByType('Ingreso').subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/type/Ingreso`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getByType debería hacer GET a /type/Egreso', () => {
    const mock = mockSummary();

    service.getByType('Egreso').subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/type/Egreso`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  // ─── create ───────────────────────────────────────────────────

  it('create debería hacer POST a la URL base con el dto de Ingreso', () => {
    const dto: CreateMovement = {
      descripcion: 'Venta producto',
      monto: 200000,
      tipoMovimiento: 'Ingreso',
    };
    const mock = mockMovimiento({ tipoMovimiento: 'Ingreso', monto: 200000 });

    service.create(dto).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });

  it('create debería hacer POST con el dto de Egreso', () => {
    const dto: CreateMovement = {
      descripcion: 'Pago nómina',
      monto: 500000,
      tipoMovimiento: 'Egreso',
    };
    const mock = mockMovimiento({ tipoMovimiento: 'Egreso', monto: 500000 });

    service.create(dto).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mock);
  });

  it('create debería enviar exactamente los campos del dto sin campos extra', () => {
    const dto: CreateMovement = {
      descripcion: 'Prueba',
      monto: 1000,
      tipoMovimiento: 'Ingreso',
    };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(Object.keys(req.request.body)).toEqual(['descripcion', 'monto', 'tipoMovimiento']);
    req.flush(mockMovimiento());
  });
});
