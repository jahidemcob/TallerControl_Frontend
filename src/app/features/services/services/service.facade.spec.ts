import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ServicesFacade } from './service.facade';
import { ServicesService } from './services.service';

describe('ServicesFacade', () => {
  let facade: ServicesFacade;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getAllServices: vi.fn(),
      getActiveServices: vi.fn(),
      getServiceById: vi.fn(),
      createService: vi.fn(),
      updateService: vi.fn(),
      toggleServiceStatus: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ServicesFacade, { provide: ServicesService, useValue: serviceMock }],
    });

    facade = TestBed.inject(ServicesFacade);
  });

  it('obtiene servicios', () => {
    serviceMock.getAllServices.mockReturnValue(of([]));

    facade.getServicios().subscribe();

    expect(serviceMock.getAllServices).toHaveBeenCalled();
  });

  it('obtiene servicios activos', () => {
    serviceMock.getActiveServices.mockReturnValue(of([]));

    facade.getServiciosActivos().subscribe();

    expect(serviceMock.getActiveServices).toHaveBeenCalled();
  });

  it('obtiene servicio por id', () => {
    serviceMock.getServiceById.mockReturnValue(of({}));

    facade.getServicioById(1).subscribe();

    expect(serviceMock.getServiceById).toHaveBeenCalledWith(1);
  });

  it('crea servicio', () => {
    serviceMock.createService.mockReturnValue(of({}));

    facade.crearServicio({} as any).subscribe();

    expect(serviceMock.createService).toHaveBeenCalled();
  });

  it('actualiza servicio', () => {
    serviceMock.updateService.mockReturnValue(of({}));

    facade.actualizarServicio({} as any).subscribe();

    expect(serviceMock.updateService).toHaveBeenCalled();
  });

  it('toggle estado servicio', () => {
    serviceMock.toggleServiceStatus.mockReturnValue(
      of({
        message: 'Estado actualizado',
        status: false,
      }),
    );

    facade.toggleEstado(1).subscribe();

    expect(serviceMock.toggleServiceStatus).toHaveBeenCalledWith(1);
  });

  it('mapea error nombreServicio', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'ServiceAlreadyExistsException',
        message: 'El servicio ya existe',
      },
    });

    expect(result.nombreServicio).toBe('El servicio ya existe');
  });

  it('mapea error precioBase', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'InvalidPriceException',
        message: 'Precio inválido',
      },
    });

    expect(result.precioBase).toBe('Precio inválido');
  });

  it('mapea error desconocido', () => {
    const result = facade.mapBackendErrors({});

    expect(result.general).toBe('Error desconocido');
  });
});
