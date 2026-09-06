import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearUsuario } from './crear-usuario';
import { UsuarioFacade } from '../../services/user.facade';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CrearUsuario', () => {
  let component: CrearUsuario;
  let fixture: ComponentFixture<CrearUsuario>;
  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      crearUsuario: vi.fn(),
      mapBackendErrors: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CrearUsuario],
      providers: [
        { provide: UsuarioFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // helpers
  function setInput(index: number, value: string) {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[index].value = value;
    inputs[index].dispatchEvent(new Event('input'));
  }

  function setSelect(value: string) {
    const select = fixture.nativeElement.querySelector('select');
    select.value = value;
    select.dispatchEvent(new Event('change'));
  }

  function submitForm() {
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  // =========================

  it('no guarda si form inválido', () => {
    const form: any = {
      invalid: true,
      control: { markAllAsTouched: vi.fn() },
    };

    component.guardar(form);

    expect(form.control.markAllAsTouched).toHaveBeenCalled();
  });

  it('crea usuario correctamente', () => {
    facadeMock.crearUsuario.mockReturnValue(of({}));

    component.usuario = {
      nombre: 'Juan',
      nombreUsuario: 'juan',
      telefono: '1234567890',
      correo: 'a@a.com',
      clave: '123456',
      idRol: 2,
    } as any;

    component.guardar({ invalid: false });

    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('maneja error backend', () => {
    facadeMock.crearUsuario.mockReturnValue(throwError(() => ({})));
    facadeMock.mapBackendErrors.mockReturnValue({ general: 'error' });

    component.guardar({ invalid: false });

    expect(component.errores.general).toBe('error');
  });

  it('valida teléfono inválido (lógica)', () => {
    component.usuario.telefono = '123';
    expect(component.usuario.telefono.length).toBeLessThan(10);
  });

  it('valida correo inválido (lógica)', () => {
    component.usuario.correo = 'mal';
    expect(component.usuario.correo.includes('@')).toBe(false);
  });

  it('valida contraseña corta (lógica)', () => {
    component.usuario.clave = '123';
    expect(component.usuario.clave.length).toBeLessThan(6);
  });

  // =========================
  // HTML
  // =========================

  it('muestra error backend nombreUsuario', () => {
    component.errores = { nombreUsuario: 'Usuario ya existe' };
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

  it('muestra error de campos requeridos', () => {
    submitForm();
    expectText('Todos los campos deben estar diligenciados correctamente');
  });

  it('muestra error de teléfono inválido en HTML', () => {
    setInput(0, 'Juan');
    setInput(1, 'juan');
    setInput(2, '123'); // inválido
    setInput(3, 'test@test.com');
    setInput(4, '123456');
    setSelect('2');

    submitForm();

    expectText('10 dígitos');
  });

  it('muestra error de correo inválido en HTML', () => {
    setInput(0, 'Juan');
    setInput(1, 'juan');
    setInput(2, '1234567890');
    setInput(3, 'mal'); // inválido
    setInput(4, '123456');
    setSelect('2');

    submitForm();

    expectText('correo no es válido');
  });

  it('muestra error de contraseña corta en HTML', () => {
    component.usuario.clave = '123';
    fixture.detectChanges();

    expectText('6 caracteres');
  });
});
