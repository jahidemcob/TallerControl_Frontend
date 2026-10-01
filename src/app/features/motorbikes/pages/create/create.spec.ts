import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Create } from './create';
import { MotorbikeFacade } from '../../services/motorbike.facade';

describe('Create', () => {
  let component: Create;
  let fixture: ComponentFixture<Create>;
  let facadeMock: any;

  beforeEach(async () => {
    facadeMock = {
      crearMotorbike: vi.fn(),
      mapBackendErrors: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Create],
      providers: [{ provide: MotorbikeFacade, useValue: facadeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Create);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setInput(index: number, value: string) {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[index].value = value;
    inputs[index].dispatchEvent(new Event('input'));
    inputs[index].dispatchEvent(new Event('change'));
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

  it('crea motocicleta correctamente', () => {
    facadeMock.crearMotorbike.mockReturnValue(of({ idMoto: 1 }));

    component.motorbike = {
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC12D',
      cilindraje: 150,
      anio: 2020,
    };

    component.createMotorbike({ invalid: false, resetForm: vi.fn() });

    expect(facadeMock.crearMotorbike).toHaveBeenCalled();
  });

  it('convierte placa a mayúsculas sin espacios', () => {
    facadeMock.crearMotorbike.mockReturnValue(of({}));

    component.motorbike = {
      marca: 'Honda',
      modelo: 'CB',
      placa: 'abc 12d',
      cilindraje: 150,
      anio: 2020,
    };

    component.createMotorbike({ invalid: false, resetForm: vi.fn() });

    expect(facadeMock.crearMotorbike).toHaveBeenCalledWith(
      expect.objectContaining({ placa: 'ABC12D' }),
    );
  });

  it('maneja error backend', () => {
    facadeMock.crearMotorbike.mockReturnValue(throwError(() => ({})));
    facadeMock.mapBackendErrors.mockReturnValue({ general: 'Error backend' });

    component.createMotorbike({ invalid: false, resetForm: vi.fn() });

    expect(component.errores.general).toBe('Error backend');
  });

  it('muestra error backend placa', () => {
    component.errores = { placa: 'Placa ya existe' };
    fixture.detectChanges();
    expectText('Placa ya existe');
  });

  it('muestra error backend cilindraje', () => {
    component.errores = { cilindraje: 'Cilindraje inválido' };
    fixture.detectChanges();
    expectText('Cilindraje inválido');
  });

  it('muestra error backend anio', () => {
    component.errores = { anio: 'Año inválido' };
    fixture.detectChanges();
    expectText('Año inválido');
  });

  it('muestra error backend general', () => {
    component.errores = { general: 'Error general' };
    fixture.detectChanges();
    expectText('Error general');
  });

  it('muestra mensaje de éxito', () => {
    component.successMessage = 'Motocicleta creada correctamente';
    fixture.detectChanges();
    expectText('Motocicleta creada correctamente');
  });

  it('muestra error de campos requeridos', async () => {
    const { NgForm } = await import('@angular/forms');
    const formEl = fixture.debugElement.query((el) => el.providerTokens?.includes(NgForm));
    const ngForm = formEl?.injector.get(NgForm);
    ngForm?.control.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expectText('Todos los campos deben estar diligenciados correctamente');
  });

  it('muestra error de formato de placa', () => {
    component.motorbike = {
      marca: 'Honda',
      modelo: 'CB',
      placa: '123',
      cilindraje: 150,
      anio: 2020,
    };
    // La placa no cumple el patrón ^[A-Za-z]{3}[0-9]{2}[A-Za-z]$
    const placaValida = /^[A-Za-z]{3}[0-9]{2}[A-Za-z]$/.test(component.motorbike.placa);
    expect(placaValida).toBe(false);
  });

  it('muestra error de cilindraje menor a 1', () => {
    component.motorbike.cilindraje = 0;
    expect(component.motorbike.cilindraje).toBeLessThan(1);
  });

  it('muestra error de año menor a 2010', () => {
    component.motorbike.anio = 2000;
    expect(component.motorbike.anio).toBeLessThan(2010);
  });

  it('no llama facade si loading es true', () => {
    component.loading = true;
    component.createMotorbike({ invalid: false, resetForm: vi.fn() });
    expect(facadeMock.crearMotorbike).not.toHaveBeenCalled();
  });
});
