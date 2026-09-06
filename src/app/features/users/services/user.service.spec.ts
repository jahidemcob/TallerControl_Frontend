import { TestBed } from '@angular/core/testing';
import { UsuarioService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../models/user.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener todos los usuarios', () => {
    const mock: Usuario[] = [
      { idUsuario: 1, idRol: 2, nombre: 'Juan', nombreUsuario: 'juan', activo: true },
    ];

    service.getAll().subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('debería obtener usuario por id', () => {
    const mock = { idUsuario: 1, idRol: 2, nombre: 'Juan', nombreUsuario: 'juan', activo: true };

    service.getById(1).subscribe((res) => {
      expect(res).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('debería crear usuario', () => {
    const mock = { idUsuario: 1 } as Usuario;

    service
      .create({
        idRol: 2,
        nombre: 'Juan',
        nombreUsuario: 'juan',
        clave: '123456',
      })
      .subscribe((res) => {
        expect(res).toEqual(mock);
      });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');

    req.flush(mock);
  });

  it('debería actualizar usuario', () => {
    const mock = { idUsuario: 1 } as Usuario;

    service
      .update(1, {
        idUsuario: 1,
        idRol: 2,
        nombre: 'Juan',
        nombreUsuario: 'juan',
      })
      .subscribe((res) => {
        expect(res).toEqual(mock);
      });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');

    req.flush(mock);
  });

  it('debería hacer toggle de estado', () => {
    service.toggleStatus(1, false).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1/disable`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ activo: false });

    req.flush({});
  });
});
