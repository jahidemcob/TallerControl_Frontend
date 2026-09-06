import { TestBed } from '@angular/core/testing';
import { UsuarioFacade } from './user.facade';
import { UsuarioService } from './user.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UsuarioFacade', () => {
  let facade: UsuarioFacade;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getAll: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      toggleStatus: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UsuarioFacade,
        { provide: UsuarioService, useValue: serviceMock },
      ],
    });

    facade = TestBed.inject(UsuarioFacade);
  });

  it('obtiene usuarios', () => {
    serviceMock.getAll.mockReturnValue(of([]));

    facade.getUsuarios().subscribe();

    expect(serviceMock.getAll).toHaveBeenCalled();
  });

  it('obtiene usuario por id', () => {
    serviceMock.getById.mockReturnValue(of({}));

    facade.getUsuario(1).subscribe();

    expect(serviceMock.getById).toHaveBeenCalledWith(1);
  });

  it('crea usuario', () => {
    serviceMock.create.mockReturnValue(of({}));

    facade.crearUsuario({} as any).subscribe();

    expect(serviceMock.create).toHaveBeenCalled();
  });

  it('actualiza usuario', () => {
    serviceMock.update.mockReturnValue(of({}));

    facade.actualizarUsuario(1, {} as any).subscribe();

    expect(serviceMock.update).toHaveBeenCalled();
  });

  it('toggle estado invierte valor', () => {
    const user: any = { idUsuario: 1, activo: true };

    serviceMock.toggleStatus.mockReturnValue(of(undefined));

    facade.toggleEstado(user).subscribe();

    expect(serviceMock.toggleStatus).toHaveBeenCalledWith(1, false);
  });

  it('mapea error correo', () => {
    const result = facade.mapBackendErrors({
      error: {
        error: 'EmailUsedException',
        message: 'Correo ya existe',
      },
    });

    expect(result.correo).toBe('Correo ya existe');
  });

  it('mapea error desconocido', () => {
    const result = facade.mapBackendErrors({});

    expect(result.general).toBe('Error desconocido');
  });
});