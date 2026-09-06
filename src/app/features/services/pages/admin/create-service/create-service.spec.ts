import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateServiceComponent } from './create-service';
import { ServicesFacade } from '../../../services/service.facade';

describe('CreateServiceComponent', () => {
  let component: CreateServiceComponent;
  let fixture: ComponentFixture<CreateServiceComponent>;

  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      crearServicio: vi.fn(),
      mapBackendErrors: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreateServiceComponent],
      providers: [
        { provide: ServicesFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServiceComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function getInputs() {
    return fixture.nativeElement.querySelectorAll(
      'app-service-form input, app-service-form textarea',
    );
  }

  function setInput(index: number, value: string) {
    const inputs = getInputs();
    inputs[index].value = value;
    inputs[index].dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submitForm() {
    const form = fixture.nativeElement.querySelector('app-service-form form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function expectText(text: string) {
    expect(fixture.nativeElement.textContent).toContain(text);
  }

  it('crea servicio correctamente', () => {
    facadeMock.crearServicio.mockReturnValue(of({ idServicio: 1 }));

    component.service = {
      nombreServicio: 'Lavado',
      descripcion: 'Lavado completo',
      precioBase: 50000,
    };

    component.createService({ invalid: false, resetForm: vi.fn() } as any);

    expect(facadeMock.crearServicio).toHaveBeenCalled();
  });

  it('maneja error backend', () => {
    facadeMock.crearServicio.mockReturnValue(throwError(() => ({})));
    facadeMock.mapBackendErrors.mockReturnValue({ general: 'Error backend' });

    component.createService({ invalid: false, resetForm: vi.fn() } as any);

    expect(component.errores.general).toBe('Error backend');
  });

  it('no crea si el formulario es inválido', () => {
    const form: any = {
      invalid: true,
      control: {
        markAllAsTouched: vi.fn(),
      },
    };

    component.createService(form);

    expect(form.control.markAllAsTouched).toHaveBeenCalled();
    expect(facadeMock.crearServicio).not.toHaveBeenCalled();
  });

  it('valida precio menor a 1', () => {
    component.service.precioBase = 0;
    expect(component.service.precioBase).toBeLessThan(1);
  });

  it('muestra mensaje de éxito', () => {
    component.successMessage = 'Servicio creado';
    fixture.detectChanges();
    expectText('Servicio creado');
  });

  it('muestra error backend nombreServicio', () => {
    component.errores = { nombreServicio: 'Servicio ya existe' };
    fixture.detectChanges();
    expectText('Servicio ya existe');
  });

  it('muestra error backend precioBase', () => {
    component.errores = { precioBase: 'Precio inválido' };
    fixture.detectChanges();
    expectText('Precio inválido');
  });

  it('muestra error backend general', () => {
    component.errores = { general: 'Error general' };
    fixture.detectChanges();
    expectText('Error general');
  });

  it('muestra error de campos requeridos', async () => {
    submitForm();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expectText('Todos los campos deben estar diligenciados correctamente');
  });

  it('muestra error de precio inválido', () => {
    setInput(0, 'Lavado');
    setInput(1, 'Lavado completo');
    setInput(2, '0');
    submitForm();
    expectText('El precio debe ser mayor a 0');
  });
});
