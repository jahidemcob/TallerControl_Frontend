import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { LoginComponent } from './login';
import { AuthFacade } from '../../../../core/services/auth.facade';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let facadeMock: any;
  let router: Router;

  beforeEach(async () => {
    facadeMock = {
      login: vi.fn(),
      getRedirectRoute: vi.fn().mockReturnValue('cliente'),
      mapLoginErrors: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthFacade, useValue: facadeMock }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('login navega a ruta correcta', () => {
    facadeMock.login.mockReturnValue(of({}));

    component.username = 'juan';
    component.password = '123456';
    component.login();

    expect(facadeMock.login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/cliente']);
  });

  it('login maneja error 401', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    facadeMock.login.mockReturnValue(throwError(() => ({ status: 401 })));
    facadeMock.mapLoginErrors.mockReturnValue({ general: 'Credenciales inválidas' });

    component.login();

    expect(component.errores.general).toBe('Credenciales inválidas');
    alertSpy.mockRestore();
  });

  it('login maneja error 404', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    facadeMock.login.mockReturnValue(throwError(() => ({ status: 404 })));
    facadeMock.mapLoginErrors.mockReturnValue({ username: 'Usuario no encontrado' });

    component.login();

    expect(component.errores.username).toBe('Usuario no encontrado');
    alertSpy.mockRestore();
  });

  it('limpia errores antes de cada login', () => {
    facadeMock.login.mockReturnValue(of({}));
    component.errores = { general: 'error previo' };
    component.login();
    expect(component.errores.general).toBeUndefined();
  });

  it('muestra input de usuario', () => {
    expect(fixture.nativeElement.querySelector('input[name="username"]')).toBeTruthy();
  });

  it('muestra input de contraseña', () => {
    expect(fixture.nativeElement.querySelector('input[name="password"]')).toBeTruthy();
  });

  it('muestra botón de ingresar', () => {
    expect(fixture.nativeElement.textContent).toContain('Ingresar');
  });
});
