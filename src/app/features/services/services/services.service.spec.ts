import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ServicesService } from './services.service';
import { environment } from '../../../../environments/environment';

describe('ServicesService', () => {
  let service: ServicesService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/services`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicesService],
    });

    service = TestBed.inject(ServicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('obtiene todos los servicios', () => {
    service.getAllServices().subscribe();

    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('obtiene servicio por id', () => {
    service.getServiceById(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('GET');

    req.flush({});
  });

  it('crea servicio', () => {
    const mockService = {
      nombreServicio: 'Lavado',
      descripcion: 'Lavado completo',
      precioBase: 100,
    };

    service.createService(mockService as any).subscribe();

    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockService);

    req.flush({});
  });

  it('actualiza servicio', () => {
    const mockService = {
      idServicio: 1,
      nombreServicio: 'Lavado',
      descripcion: 'Editado',
      precioBase: 200,
    };

    service.updateService(mockService as any).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockService);

    req.flush({
      message: 'Actualizado',
    });
  });

  it('toggle estado servicio', () => {
    service.toggleServiceStatus(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1/disable`);

    expect(req.request.method).toBe('PATCH');

    req.flush({
      message: 'Estado actualizado',
      status: false,
    });
  });

  it('obtiene servicios activos', () => {
    service.getActiveServices().subscribe();

    const req = httpMock.expectOne(`${apiUrl}?onlyActive=true`);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });
});
