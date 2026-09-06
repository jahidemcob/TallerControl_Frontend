import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaUsuarios } from './lista-usuarios';
import { UsuarioFacade } from '../../services/user.facade';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommonModule } from '@angular/common';

describe('ListaUsuarios', () => {
  let component: ListaUsuarios;
  let fixture: ComponentFixture<ListaUsuarios>;
  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getUsuarios: vi.fn(),
      toggleEstado: vi.fn().mockReturnValue(of(void 0)),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ListaUsuarios, CommonModule], // 🔥 IMPORTANTE
      providers: [
        { provide: UsuarioFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaUsuarios);
    component = fixture.componentInstance;
  });

  function renderWithUsers(users: any[]) {
    facadeMock.getUsuarios.mockReturnValue(of(users));
    component.cargarUsuarios();
    fixture.detectChanges();
  }

  it('renderiza usuarios en la tabla', () => {
    renderWithUsers([
      { idUsuario: 1, nombre: 'Juan', nombreUsuario: 'juan', correo: 'a', idRol: 1, activo: true },
      { idUsuario: 2, nombre: 'Ana', nombreUsuario: 'ana', correo: 'b', idRol: 3, activo: false },
    ]);

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('muestra roles correctamente', () => {
    renderWithUsers([
      { idUsuario: 1, idRol: 1, activo: true },
      { idUsuario: 2, idRol: 2, activo: true },
      { idUsuario: 3, idRol: 3, activo: true },
      { idUsuario: 4, idRol: 99, activo: true },
    ]);

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Admin');
    expect(text).toContain('Empleado');
    expect(text).toContain('Cliente');
    expect(text).toContain('Sin rol');
  });

  it('muestra estado activo/inactivo', () => {
    renderWithUsers([
      { idUsuario: 1, activo: true },
      { idUsuario: 2, activo: false },
    ]);

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Activo');
    expect(text).toContain('Inactivo');
  });

  it('botón crear ejecuta método', () => {
    facadeMock.getUsuarios.mockReturnValue(of([])); // 🔥 IMPORTANTE

    fixture.detectChanges();

    const spy = vi.spyOn(component, 'crear');

    fixture.nativeElement.querySelector('.btn-create').click();

    expect(spy).toHaveBeenCalled();
  });

  it('botón editar ejecuta método', () => {
    renderWithUsers([{ idUsuario: 1, activo: true }]);

    const spy = vi.spyOn(component, 'editar');

    fixture.nativeElement.querySelector('.btn-edit').click();

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('botón toggle ejecuta método', () => {
    const user = { idUsuario: 1, activo: true };

    renderWithUsers([user]);

    const spy = vi.spyOn(component, 'toggleEstado');

    fixture.nativeElement.querySelector('.btn-state').click();

    expect(spy).toHaveBeenCalledWith(user);
  });

  it('botón toggle se deshabilita cuando está cargando', () => {
    const user = { idUsuario: 1, activo: true };

    component.loadingIds = [1];

    facadeMock.getUsuarios.mockReturnValue(of([user]));

    fixture.detectChanges(); // solo una vez

    const btn = fixture.nativeElement.querySelector('.btn-state');

    expect(btn.disabled).toBe(true);
  });

  it('maneja error al cargar', () => {
    facadeMock.getUsuarios.mockReturnValue(throwError(() => ({})));

    component.cargarUsuarios();

    expect(component.usuarios).toEqual([]);
  });
});
