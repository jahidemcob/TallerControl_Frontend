import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(user: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, user);
  }

  update(id: number, user: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, user);
  }

  toggleStatus(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/disable`, { activo });
  }
}
