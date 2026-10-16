import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { MotorbikeService } from './motorbike.service';
import { environment } from '../../../../environments/environment';

describe('MotorbikeService', () => {
  let service: MotorbikeService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/Motorbike`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MotorbikeService],
    });

    service = TestBed.inject(MotorbikeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAllMotorbikes hace GET a la url correcta', () => {
    service.getAllMotorbikes().subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getMotorbikeById hace GET con el id correcto', () => {
    service.getMotorbikeById(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('createMotorbike hace POST con el body correcto', () => {
    const motorbike = {
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC123',
      cilindraje: 150,
      anio: 2020,
    };
    service.createMotorbike(motorbike).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(motorbike);
    req.flush({});
  });

  it('updateMotorbike hace PUT con el id y body correctos', () => {
    const motorbike = {
      idMoto: 1,
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC123',
      cilindraje: 150,
      anio: 2020,
    };
    service.updateMotorbike(motorbike).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(motorbike);
    req.flush({ message: 'ok' });
  });

  it('toggleMotorbikeStatus hace PATCH con el id correcto', () => {
    service.toggleMotorbikeStatus(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/disable`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: 'ok', status: false });
  });
});
