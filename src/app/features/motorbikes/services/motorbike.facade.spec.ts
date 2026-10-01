import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MotorbikeFacade } from './motorbike.facade';
import { MotorbikeService } from './motorbike.service';

describe('MotorbikeFacade', () => {
  let facade: MotorbikeFacade;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      getAllMotorbikes: vi.fn(),
      getMotorbikeById: vi.fn(),
      createMotorbike: vi.fn(),
      updateMotorbike: vi.fn(),
      toggleMotorbikeStatus: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [MotorbikeFacade, { provide: MotorbikeService, useValue: serviceMock }],
    });

    facade = TestBed.inject(MotorbikeFacade);
  });

  it('getMotorbikes llama getAllMotorbikes', () => {
    serviceMock.getAllMotorbikes.mockReturnValue(of([]));
    facade.getMotorbikes().subscribe();
    expect(serviceMock.getAllMotorbikes).toHaveBeenCalled();
  });

  it('getMotorbikeById llama getMotorbikeById con id', () => {
    serviceMock.getMotorbikeById.mockReturnValue(of({}));
    facade.getMotorbikeById(1).subscribe();
    expect(serviceMock.getMotorbikeById).toHaveBeenCalledWith(1);
  });

  it('crearMotorbike llama createMotorbike', () => {
    const motorbike = {
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC123',
      cilindraje: 150,
      anio: 2020,
    };
    serviceMock.createMotorbike.mockReturnValue(of({}));
    facade.crearMotorbike(motorbike).subscribe();
    expect(serviceMock.createMotorbike).toHaveBeenCalledWith(motorbike);
  });

  it('actualizarMotorbike llama updateMotorbike', () => {
    const motorbike = {
      idMoto: 1,
      marca: 'Honda',
      modelo: 'CB',
      placa: 'ABC123',
      cilindraje: 150,
      anio: 2020,
    };
    serviceMock.updateMotorbike.mockReturnValue(of({ message: 'ok' }));
    facade.actualizarMotorbike(motorbike).subscribe();
    expect(serviceMock.updateMotorbike).toHaveBeenCalledWith(motorbike);
  });

  it('toggleEstado llama toggleMotorbikeStatus con id', () => {
    serviceMock.toggleMotorbikeStatus.mockReturnValue(of({ message: 'ok', status: false }));
    facade.toggleEstado(1).subscribe();
    expect(serviceMock.toggleMotorbikeStatus).toHaveBeenCalledWith(1);
  });

  it('mapBackendErrors retorna error de placa cuando MotorbikeAlreadyExistsException', () => {
    const err = { error: { error: 'MotorbikeAlreadyExistsException', message: 'Placa ya existe' } };
    expect(facade.mapBackendErrors(err).placa).toBe('Placa ya existe');
  });

  it('mapBackendErrors retorna error de anio cuando InvalidYearException', () => {
    const err = { error: { error: 'InvalidYearException', message: 'Año inválido' } };
    expect(facade.mapBackendErrors(err).anio).toBe('Año inválido');
  });

  it('mapBackendErrors retorna error de cilindraje cuando InvalidCilindrajeException', () => {
    const err = { error: { error: 'InvalidCilindrajeException', message: 'Cilindraje inválido' } };
    expect(facade.mapBackendErrors(err).cilindraje).toBe('Cilindraje inválido');
  });

  it('mapBackendErrors retorna general cuando error desconocido', () => {
    const err = { error: { error: 'OtroError', message: 'Algo salió mal' } };
    expect(facade.mapBackendErrors(err).general).toBe('Algo salió mal');
  });

  it('mapBackendErrors retorna Error desconocido cuando no hay mensaje', () => {
    const err = { error: {} };
    expect(facade.mapBackendErrors(err).general).toBe('Error desconocido');
  });
});
