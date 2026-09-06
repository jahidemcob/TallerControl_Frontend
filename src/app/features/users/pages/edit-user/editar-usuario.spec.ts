import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarUsuario } from './editar-usuario';
import { UsuarioFacade } from '../../services/user.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EditarUsuario', () => {
  let component: EditarUsuario;
  let fixture: ComponentFixture<EditarUsuario>;
  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getUsuario: vi.fn().mockReturnValue(
        of({
          idUsuario: 1,
          idRol: 2,
          nombre: 'Juan',
          nombreUsuario: 'juan',
          telefono: '1234567890',
          correo: 'test@test.com',
          activo: true,
        }),
      ),
      actualizarUsuario: vi.fn().mockReturnValue(of({})),
      mapBackendErrors: vi.fn(),
    };

    routerMock = { navigate: vi.fn() };

    const routeMock = {
      snapshot: { paramMap: { get: () => '1' } },
    };

    await TestBed.configureTestingModule({
      imports: [EditarUsuario],
      providers: [
        { provide: UsuarioFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 🔥 helpers
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

  it('carga usuario', () => {
    expect(component.user).toBeDefined();
    expect(component.user.nombre).toBe('Juan');
  });

  it('no permite contraseña corta (lógica)', () => {
    component.user.clave = '123';
    expect(component.user.clave.length).toBeLessThan(6);
  });

  it('no ejecuta si user inválido', () => {
    component.user = { idUsuario: undefined } as any;
    component.guardar({ invalid: false });
    expect(facadeMock.actualizarUsuario).not.toHaveBeenCalled();
  });

  it('actualiza correctamente', () => {
    component.user.clave = '123456';
    component.guardar({ invalid: false });

    expect(facadeMock.actualizarUsuario).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('maneja error backend', () => {
    facadeMock.actualizarUsuario.mockReturnValue(throwError(() => ({})));
    facadeMock.mapBackendErrors.mockReturnValue({ general: 'error' });
    component.user.clave = '123456';

    component.guardar({ invalid: false });

    expect(component.errores.general).toBe('error');
  });

  // =========================
  // HTML
  // =========================

  it('muestra error de campos requeridos', () => {
    setInput(0, '');
    setInput(1, '');
    setInput(2, '');
    setInput(3, '');
    setSelect('');

    submitForm();

    expectText('Todos los campos deben estar diligenciados correctamente');
  });

  it('muestra error teléfono inválido', () => {
    setInput(0, 'Juan');
    setInput(1, 'juan');
    setInput(2, '123');
    setInput(3, 'test@test.com');
    setSelect('2');

    submitForm();

    expectText('10 dígitos');
  });

  it('muestra error correo inválido', () => {
    setInput(0, 'Juan');
    setInput(1, 'juan');
    setInput(2, '1234567890');
    setInput(3, 'mal');
    setSelect('2');

    submitForm();

    expectText('correo no es válido');
  });

  it('muestra error contraseña corta en HTML', () => {
    setInput(0, 'Juan');
    setInput(1, 'juan');
    setInput(2, '1234567890');
    setInput(3, 'test@test.com');

    component.user.clave = '123';
    setSelect('2');

    submitForm();

    expectText('6 caracteres');
  });

  it('botón se deshabilita cuando contraseña es corta', () => {
    component.user.clave = '123';
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBe(true);
  });
});
