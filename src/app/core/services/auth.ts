import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { LoginRequest, AuthResponse, JwtPayload, RegisterRequest } from '../models/model.auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        localStorage.setItem('usuario', JSON.stringify(response));
      }),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.role?.toLowerCase() || decoded?.rol?.toLowerCase() || null;
  }

  getRedirectRoute(): string {
    const rol = this.getUserRole();

    const roleMap: Record<string, string> = {
      administrador: 'admin',
      empleado: 'empleado',
      cliente: 'cliente',
    };

    return roleMap[rol || 'cliente'] || 'cliente';
  }

  isLoggedIn(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded?.exp) return false;

    return decoded.exp * 1000 > Date.now();
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { idToken }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        localStorage.setItem('usuario', JSON.stringify(response));
      }),
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
