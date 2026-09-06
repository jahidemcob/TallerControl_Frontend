import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthFacade } from './auth.facade';
import { AuthService } from './auth';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      login: vi.fn(),
      register: vi.fn(),
      getRedirectRoute: vi.fn(),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AuthFacade, { provide: AuthService, useValue: serviceMock }],
    });

    facade = TestBed.inject(AuthFacade);
  });

  it('login llama authService.login', () => {
    serviceMock.login.mockReturnValue(of({}));
    facade.login({ username: 'juan', clave: '123' }).subscribe();
    expect(serviceMock.login).toHaveBeenCalled();
  });

  it('register llama authService.register', () => {
    serviceMock.register.mockReturnValue(of({}));
    facade
      .register({
        Nombre: 'Juan',
        NombreUsuario: 'juan',
        Telefono: '1234567890',
        Correo: 'j@j.com',
        Clave: '123456',
      })
      .subscribe();
    expect(serviceMock.register).toHaveBeenCalled();
  });

  it('getRedirectRoute llama authService.getRedirectRoute', () => {
    serviceMock.getRedirectRoute.mockReturnValue('admin');
    expect(facade.getRedirectRoute()).toBe('admin');
  });

  it('logout llama authService.logout', () => {
    facade.logout();
    expect(serviceMock.logout).toHaveBeenCalled();
  });

  // mapLoginErrors
  it('mapLoginErrors retorna general en 401', () => {
    const err = { status: 401, error: { message: 'Credenciales inválidas' } };
    expect(facade.mapLoginErrors(err).general).toBe('Credenciales inválidas');
  });

  it('mapLoginErrors retorna general en 403', () => {
    const err = { status: 403, error: { message: 'Usuario desactivado' } };
    expect(facade.mapLoginErrors(err).general).toBe('Usuario desactivado');
  });

  it('mapLoginErrors retorna username en 404', () => {
    const err = { status: 404, error: { message: 'Usuario no encontrado' } };
    expect(facade.mapLoginErrors(err).username).toBe('Usuario no encontrado');
  });

  it('mapLoginErrors retorna general en 400', () => {
    const err = { status: 400, error: { message: 'Datos inválidos' } };
    expect(facade.mapLoginErrors(err).general).toBe('Datos inválidos');
  });

  it('mapLoginErrors retorna general en error inesperado', () => {
    const err = { status: 500, error: { message: 'Error inesperado' } };
    expect(facade.mapLoginErrors(err).general).toBe('Error inesperado');
  });

  it('mapLoginErrors usa mensaje por defecto si no hay message', () => {
    const err = { status: 401, error: {} };
    expect(facade.mapLoginErrors(err).general).toBe('Usuario o contraseña incorrectos');
  });

  // mapRegisterErrors
  it('mapRegisterErrors retorna usuario en UserAlreadyExistsException', () => {
    const err = { error: { error: 'UserAlreadyExistsException', message: 'Usuario ya existe' } };
    expect(facade.mapRegisterErrors(err).usuario).toBe('Usuario ya existe');
  });

  it('mapRegisterErrors retorna correo en EmailAlreadyExistsException', () => {
    const err = { error: { error: 'EmailAlreadyExistsException', message: 'Correo ya existe' } };
    expect(facade.mapRegisterErrors(err).correo).toBe('Correo ya existe');
  });

  it('mapRegisterErrors retorna general en error desconocido', () => {
    const err = { error: { error: 'OtroError', message: 'Algo salió mal' } };
    expect(facade.mapRegisterErrors(err).general).toBe('Algo salió mal');
  });

  it('mapRegisterErrors usa mensaje por defecto si no hay message', () => {
    const err = { error: {} };
    expect(facade.mapRegisterErrors(err).general).toBe('Error al registrar usuario');
  });
});
