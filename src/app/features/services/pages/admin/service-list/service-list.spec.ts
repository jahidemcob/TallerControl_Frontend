import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ServiceListComponent } from './service-list';
import { ServicesFacade } from '../../../services/service.facade';

describe('ServiceListComponent', () => {
  let component: ServiceListComponent;
  let fixture: ComponentFixture<ServiceListComponent>;

  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getServicios: vi.fn(),
      toggleEstado: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ServiceListComponent],
      providers: [
        { provide: ServicesFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    facadeMock.getServicios.mockReturnValue(
      of([
        {
          idServicio: 1,
          nombreServicio: 'Lavado',
          descripcion: 'Desc',
          precioBase: 10000,
          isActive: true,
        },
      ]),
    );

    facadeMock.toggleEstado.mockReturnValue(of({ status: false }));

    fixture = TestBed.createComponent(ServiceListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  it('carga servicios al iniciar', () => {
    expect(facadeMock.getServicios).toHaveBeenCalled();
  });

  it('navega a crear servicio', () => {
    component.goToCreate();
    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('navega a editar servicio', () => {
    component.goToEdit(1);
    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('toggle estado servicio', () => {
    const service = { idServicio: 1, isActive: true };
    component.toggleStatus(service as any);
    expect(facadeMock.toggleEstado).toHaveBeenCalledWith(1);
  });

  it('trackById retorna idServicio', () => {
    const result = component.trackById(0, { idServicio: 99 } as any);
    expect(result).toBe(99);
  });

  it('muestra servicios en HTML', () => {
    expectText('Lavado');
    expectText('Desc');
  });

  it('muestra estado activo', () => {
    expectText('Activo');
  });

  it('muestra botones editar y desactivar', () => {
    expectText('Editar');
    expectText('Desactivar');
  });

  it('muestra estado vacío', () => {
    facadeMock.getServicios.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expectText('No hay servicios registrados');
  });

  it('muestra activar cuando servicio está inactivo', async () => {
    facadeMock.getServicios.mockReturnValue(
      of([
        {
          idServicio: 1,
          nombreServicio: 'Lavado',
          descripcion: 'Completo',
          precioBase: 50000,
          isActive: false,
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
});
