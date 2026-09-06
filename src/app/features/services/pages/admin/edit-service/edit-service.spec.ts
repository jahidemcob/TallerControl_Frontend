import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EditService } from './edit-service';
import { ServicesFacade } from '../../../services/service.facade';

describe('EditServiceComponent', () => {
  let component: EditService;
  let fixture: ComponentFixture<EditService>;

  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getServicioById: vi.fn(),
      actualizarServicio: vi.fn(),
      mapBackendErrors: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [EditService],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1',
              },
            },
          },
        },
        { provide: ServicesFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    facadeMock.getServicioById.mockReturnValue(
      of({
        idServicio: 1,
        nombreServicio: 'Lavado',
        descripcion: 'Desc',
        precioBase: 20000,
      }),
    );

    fixture = TestBed.createComponent(EditService);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function setInput(index: number, value: string) {
    const inputs = fixture.nativeElement.querySelectorAll('input, textarea');

    inputs[index].value = value;
    inputs[index].dispatchEvent(new Event('input'));

    fixture.detectChanges();
  }

  function submitForm() {
    const form = fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit'));

    fixture.detectChanges();
  }

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  it('carga servicio al iniciar', () => {
    expect(facadeMock.getServicioById).toHaveBeenCalledWith(1);
  });

  it('actualiza servicio correctamente', () => {
    facadeMock.actualizarServicio.mockReturnValue(
      of({
        message: 'ok',
      }),
    );

    component.updateService();

    expect(facadeMock.actualizarServicio).toHaveBeenCalled();
  });

  it('maneja error backend', () => {
    facadeMock.actualizarServicio.mockReturnValue(throwError(() => ({})));

    facadeMock.mapBackendErrors.mockReturnValue({
      general: 'Error backend',
    });

    component.updateService();

    expect(component.errores.general).toBe('Error backend');
  });

  it('muestra error backend nombreServicio', () => {
    component.errores = {
      nombreServicio: 'Servicio repetido',
    };

    fixture.detectChanges();

    expectText('Servicio repetido');
  });

  it('muestra error backend precioBase', () => {
    component.errores = {
      precioBase: 'Precio inválido',
    };

    fixture.detectChanges();

    expectText('Precio inválido');
  });

  it('muestra error backend general', () => {
    component.errores = {
      general: 'Error general',
    };

    fixture.detectChanges();

    expectText('Error general');
  });

  it('muestra error de campos requeridos', () => {
    setInput(0, '');
    setInput(1, '');
    setInput(2, '');

    submitForm();

    expectText('Todos los campos deben estar diligenciados correctamente');
  });

  it('muestra error precio menor a 1', () => {
    setInput(0, 'Lavado');
    setInput(1, 'Desc');
    setInput(2, '0');

    submitForm();

    expectText('El precio debe ser mayor a 0');
  });
});
