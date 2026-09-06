import { Injectable } from '@angular/core';
import { UsuarioService } from './user.service';
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  BackendErrors,
  ApiError,
} from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioFacade {
  constructor(private readonly service: UsuarioService) {}


  getUsuarios(): Observable<Usuario[]> {
    return this.service.getAll();
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.service.getById(id);
  }

  actualizarUsuario(id: number, user: UsuarioUpdate): Observable<Usuario> {
    return this.service.update(id, user);
  }

  toggleEstado(user: Usuario): Observable<void> {
    return this.service.toggleStatus(user.idUsuario, !user.activo);
  }

  crearUsuario(user: UsuarioCreate): Observable<Usuario> {
    return this.service.create(user);
  }

  mapBackendErrors(errorResponse: any): BackendErrors {
    const err: ApiError = errorResponse?.error;

    const errorMap: Record<string, keyof BackendErrors> = {
      EmailUsedException: 'correo',
      UserAlreadyUsedException: 'nombreUsuario',
      RolNotExistException: 'general',
    };

    const errores: BackendErrors = {};

    if (err?.error && errorMap[err.error]) {
      errores[errorMap[err.error]] = err.message;
    } else {
      errores.general = err?.message || 'Error desconocido';
    }

    return errores;
  }
}
