import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RegisterComponent } from './register';
import { AuthFacade } from '../../../../core/services/auth.facade';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let facadeMock: any;
  let router: Router;

  beforeEach(async () => {
    facadeMock = {
      register: vi.fn(),
      mapRegisterErrors: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [{ provide: AuthFacade, useValue: facadeMock }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  it('registra usuario correctamente', () => {
    facadeMock.register.mockReturnValue(of({}));

    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: '123456',
      },
      reset: vi.fn(),
    });

    expect(facadeMock.register).toHaveBeenCalled();
    expect(component.mensajeExito).toBe('Usuario registrado correctamente');
  });

  it('no registra si form inválido', () => {
    const form = {
      invalid: true,
      control: { markAllAsTouched: vi.fn() },
      value: {},
      reset: vi.fn(),
    };

    component.registrar(form);

    expect(facadeMock.register).not.toHaveBeenCalled();
    expect(component.mensaje).toBe('Todos los campos deben estar completos correctamente');
  });

  it('no registra si contraseñas no coinciden', () => {
    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: 'diferente',
      },
      reset: vi.fn(),
    });

    expect(facadeMock.register).not.toHaveBeenCalled();
    expect(component.mensaje).toBe('Las contraseñas no coinciden');
  });

  it('maneja error usuario ya existe', () => {
    facadeMock.register.mockReturnValue(throwError(() => ({})));
    facadeMock.mapRegisterErrors.mockReturnValue({ usuario: 'Usuario ya existe' });

    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: '123456',
      },
      reset: vi.fn(),
    });

    expect(component.errores.usuario).toBe('Usuario ya existe');
  });

  it('maneja error correo ya existe', () => {
    facadeMock.register.mockReturnValue(throwError(() => ({})));
    facadeMock.mapRegisterErrors.mockReturnValue({ correo: 'Correo ya existe' });

    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: '123456',
      },
      reset: vi.fn(),
    });

    expect(component.errores.correo).toBe('Correo ya existe');
  });

  it('maneja error general backend', () => {
    facadeMock.register.mockReturnValue(throwError(() => ({})));
    facadeMock.mapRegisterErrors.mockReturnValue({ general: 'Error general' });

    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: '123456',
      },
      reset: vi.fn(),
    });

    expect(component.errores.general).toBe('Error general');
  });

  it('muestra error backend usuario', () => {
    component.errores = { usuario: 'Usuario ya existe' };
    fixture.detectChanges();
    expectText('Usuario ya existe');
  });

  it('muestra error backend correo', () => {
    component.errores = { correo: 'Correo ya existe' };
    fixture.detectChanges();
    expectText('Correo ya existe');
  });

  it('muestra error backend general', () => {
    component.errores = { general: 'Error general' };
    fixture.detectChanges();
    expectText('Error general');
  });

  it('muestra mensaje de éxito', () => {
    component.mensajeExito = 'Usuario registrado correctamente';
    fixture.detectChanges();
    expectText('Usuario registrado correctamente');
  });

  it('setCampoActivo asigna campo', () => {
    component.setCampoActivo('correo');
    expect(component.campoActivo).toBe('correo');
  });

  it('limpia mensajes al registrar', () => {
    facadeMock.register.mockReturnValue(of({}));
    component.mensaje = 'mensaje previo';
    component.mensajeExito = 'exito previo';

    component.registrar({
      invalid: false,
      value: {
        nombre: 'Juan',
        usuario: 'juan',
        telefono: '1234567890',
        correo: 'j@j.com',
        clave: '123456',
        confirmarClave: '123456',
      },
      reset: vi.fn(),
    });

    expect(component.mensaje).toBe('');
  });
});
