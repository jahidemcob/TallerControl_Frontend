import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Edit } from './edit';
import { MotorbikeFacade } from '../../services/motorbike.facade';

describe('Edit', () => {
  let component: Edit;
  let fixture: ComponentFixture<Edit>;
  let facadeMock: any;
  let routerMock: any;

  beforeEach(async () => {
    facadeMock = {
      getMotorbikeById: vi.fn().mockReturnValue(
        of({
          idMoto: 1,
          marca: 'Honda',
          modelo: 'CB',
          cilindraje: 150,
          anio: 2020,
        }),
      ),
      actualizarMotorbike: vi.fn(),
      mapBackendErrors: vi.fn(),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Edit],
      providers: [
        { provide: MotorbikeFacade, useValue: facadeMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Edit);
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

  it('carga motocicleta al iniciar', () => {
    expect(facadeMock.getMotorbikeById).toHaveBeenCalledWith(1);
    expect(component.motorbike.marca).toBe('Honda');
  });

  it('actualiza motocicleta correctamente', () => {
    facadeMock.actualizarMotorbike.mockReturnValue(of({ message: 'ok' }));
    component.updateService();
    expect(facadeMock.actualizarMotorbike).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalled();
  });

  it('maneja error backend', () => {
    facadeMock.actualizarMotorbike.mockReturnValue(throwError(() => ({})));
    facadeMock.mapBackendErrors.mockReturnValue({ general: 'Error backend' });
    component.updateService();
    expect(component.errores.general).toBe('Error backend');
  });

  it('maneja error al cargar motocicleta', () => {
    facadeMock.getMotorbikeById.mockReturnValue(throwError(() => ({})));
    component.loadMotorbike(1);
    expect(component.errores.general).toBe('Motocicleta no encontrada');
  });

  it('no actualiza si loading es true', () => {
    component.loading = true;
    component.updateService();
    expect(facadeMock.actualizarMotorbike).not.toHaveBeenCalled();
  });

  it('muestra error backend general', () => {
    component.errores = { general: 'Error general' };
    fixture.detectChanges();
    expectText('Error general');
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

  it('cilindraje 0 es menor al mínimo permitido', () => {
    component.motorbike.cilindraje = 0;
    expect(component.motorbike.cilindraje).toBeLessThan(1);
  });

  it('muestra error año menor a 2010', async () => {
    const { NgForm } = await import('@angular/forms');
    const formEl = fixture.debugElement.query((el) => el.providerTokens?.includes(NgForm));
    const ngForm = formEl?.injector.get(NgForm);

    component.motorbike.cilindraje = 150;
    component.motorbike.anio = 2000;
    fixture.detectChanges();
    ngForm?.control.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expectText('El año debe ser mayor a 2009');
  });
});
