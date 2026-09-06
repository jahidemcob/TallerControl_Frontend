import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ServiceList } from './service-list';
import { ServicesFacade } from '../../../services/service.facade';

describe('ServiceList', () => {
  let component: ServiceList;
  let fixture: ComponentFixture<ServiceList>;
  let facadeMock: any;

  beforeEach(async () => {
    facadeMock = {
      getServiciosActivos: vi.fn().mockReturnValue(
        of([
          {
            idServicio: 1,
            nombreServicio: 'Lavado',
            descripcion: 'Desc',
            precioBase: 10000,
            isActive: true,
          },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ServiceList],
      providers: [{ provide: ServicesFacade, useValue: facadeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga servicios al iniciar', () => {
    expect(facadeMock.getServiciosActivos).toHaveBeenCalled();
    expect(component.services.length).toBe(1);
  });

  it('asigna los servicios correctamente', () => {
    expect(component.services[0].nombreServicio).toBe('Lavado');
    expect(component.services[0].precioBase).toBe(10000);
  });

  it('maneja error en carga', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    facadeMock.getServiciosActivos.mockReturnValue(throwError(() => new Error('fallo')));

    component.loadServices();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('lista vacía cuando no hay servicios', () => {
    facadeMock.getServiciosActivos.mockReturnValue(of([]));

    component.loadServices();

    expect(component.services.length).toBe(0);
  });

  it('trackById retorna idServicio', () => {
    const result = component.trackById(0, {
      idServicio: 5,
      nombreServicio: 'Test',
      descripcion: 'Desc',
      precioBase: 1000,
      isActive: true,
    });

    expect(result).toBe(5);
  });
});
