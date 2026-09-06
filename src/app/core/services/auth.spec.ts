import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuthService } from './auth';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: any;

  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerMock }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('login hace POST y guarda token', () => {
    const mockResponse = { token: 'abc123', idUsuario: 1, rol: 'cliente' };

    service.login({ username: 'juan', clave: '123456' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('token')).toBe('abc123');
  });

  it('login guarda usuario en localStorage', () => {
    const mockResponse = { token: 'abc123', idUsuario: 1, rol: 'cliente' };

    service.login({ username: 'juan', clave: '123456' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mockResponse);

    expect(localStorage.getItem('usuario')).toBeTruthy();
  });

  it('register hace POST correctamente', () => {
    const data = {
      Nombre: 'Juan',
      NombreUsuario: 'juan',
      Telefono: '1234567890',
      Correo: 'j@j.com',
      Clave: '123456',
    };

    service.register(data).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getToken retorna null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken retorna token guardado', () => {
    localStorage.setItem('token', 'mitoken');
    expect(service.getToken()).toBe('mitoken');
  });

  it('getDecodedToken retorna null si no hay token', () => {
    expect(service.getDecodedToken()).toBeNull();
  });

  it('getDecodedToken retorna null si token inválido', () => {
    localStorage.setItem('token', 'token.invalido');
    expect(service.getDecodedToken()).toBeNull();
  });

  it('getUserRole retorna null si no hay token', () => {
    expect(service.getUserRole()).toBeNull();
  });

  it('getRedirectRoute retorna cliente por defecto', () => {
    expect(service.getRedirectRoute()).toBe('cliente');
  });

  it('isLoggedIn retorna false si no hay token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout limpia localStorage y navega a login', () => {
    localStorage.setItem('token', 'abc');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
