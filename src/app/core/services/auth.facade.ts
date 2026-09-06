import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/model.auth';

export interface AuthErrors {
  username?: string;
  password?: string;
  correo?: string;
  usuario?: string;
  general?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  constructor(private readonly authService: AuthService) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.authService.login(data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.authService.register(data);
  }

  getRedirectRoute(): string {
    return this.authService.getRedirectRoute();
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.authService.loginWithGoogle(idToken);
  }

  logout() {
    this.authService.logout();
  }

  mapLoginErrors(err: any): AuthErrors {
    const backendMessage = err.error?.message;

    const errores: AuthErrors = {};

    if (err.status === 401) {
      errores.general = backendMessage || 'Usuario o contraseña incorrectos';
    } else if (err.status === 403) {
      errores.general = backendMessage || 'Usuario desactivado';
    } else if (err.status === 404) {
      errores.username = backendMessage || 'Usuario no encontrado';
    } else if (err.status === 400) {
      errores.general = backendMessage || 'Datos inválidos';
    } else {
      errores.general = backendMessage || 'Error inesperado';
    }

    return errores;
  }

  mapRegisterErrors(err: any): AuthErrors {
    const backendMessage = err.error?.message;

    const errores: AuthErrors = {};

    const errorMap: Record<string, keyof AuthErrors> = {
      UserAlreadyExistsException: 'usuario',
      EmailAlreadyExistsException: 'correo',
    };

    if (err.error?.error && errorMap[err.error.error]) {
      errores[errorMap[err.error.error]] = backendMessage;
    } else {
      errores.general = backendMessage || 'Error al registrar usuario';
    }

    return errores;
  }
}
