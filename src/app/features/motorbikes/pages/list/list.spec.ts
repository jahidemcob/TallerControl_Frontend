import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MotorbikeListComponent } from './list';
import { MotorbikeFacade } from '../../services/motorbike.facade';

describe('MotorbikeListComponent', () => {
  let component: MotorbikeListComponent;
  let fixture: ComponentFixture<MotorbikeListComponent>;
  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getMotorbikes: vi.fn().mockReturnValue(
        of([
          {
            idMoto: 1,
            marca: 'Honda',
            modelo: 'CB',
            placa: 'ABC12D',
            cilindraje: 150,
            anio: 2020,
            activo: true,
          },
        ]),
      ),
      toggleEstado: vi.fn().mockReturnValue(of({ message: 'ok', status: false })),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MotorbikeListComponent],
      providers: [
        { provide: MotorbikeFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MotorbikeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  it('carga motocicletas al iniciar', () => {
    expect(facadeMock.getMotorbikes).toHaveBeenCalled();
    expect(component.motorbikes.length).toBe(1);
  });

  it('navega a crear motocicleta', () => {
    component.goToCreate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/motocicletas/crear']);
  });

  it('navega a editar motocicleta', () => {
    component.goToEdit(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/motocicletas/editar', 1]);
  });

  it('toggle estado motocicleta', () => {
    const moto = { idMoto: 1, activo: true } as any;
    component.toggleStatus(moto);
    expect(facadeMock.toggleEstado).toHaveBeenCalledWith(1);
    expect(moto.activo).toBe(false);
  });

  it('trackById retorna idMoto', () => {
    const result = component.trackById(0, {
      idMoto: 5,
      idUsuario: 1,
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC12D',
      cilindraje: 150,
      anio: 2020,
      activo: true,
    });
    expect(result).toBe(5);
  });

  it('muestra datos de la motocicleta en HTML', () => {
    expectText('Honda');
    expectText('ABC12D');
  });

  it('muestra estado activo', () => {
    expectText('Activo');
  });

  it('muestra botón desactivar cuando activo', () => {
    expectText('Desactivar');
  });

  it('muestra activar cuando motocicleta está inactiva', async () => {
    facadeMock.getMotorbikes.mockReturnValue(
      of([
        {
          idMoto: 1,
          marca: 'Honda',
          modelo: 'CB',
          placa: 'ABC12D',
          cilindraje: 150,
          anio: 2020,
          activo: false,
        },
      ]),
    );

    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.btn-state');
    expect(buttons[0].textContent).toContain('Activar');
  });

  it('lista vacía cuando no hay motocicletas', () => {
    facadeMock.getMotorbikes.mockReturnValue(of([]));
    component.loadMotorbikes();
    fixture.detectChanges();
    expect(component.motorbikes.length).toBe(0);
  });

  it('maneja error en carga', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    facadeMock.getMotorbikes.mockReturnValue(throwError(() => new Error('fallo')));
    component.loadMotorbikes();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('maneja error en toggle estado', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    facadeMock.toggleEstado.mockReturnValue(throwError(() => new Error('fallo')));
    component.toggleStatus({ idMoto: 1, activo: true } as any);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
