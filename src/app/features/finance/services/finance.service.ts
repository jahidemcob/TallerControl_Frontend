import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/* CORRECCIÓN: se fusionan los dos imports de '../models/finance.model' en uno solo */
import { CreateMovement, FinancesSummary, Movement, MovementType } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/Finances`;

  getAll(): Observable<FinancesSummary> {
    return this.http.get<FinancesSummary>(this.apiUrl);
  }

  getById(id: number): Observable<Movement> {
    return this.http.get<Movement>(`${this.apiUrl}/${id}`);
  }

  getByType(type: MovementType): Observable<FinancesSummary> {
    return this.http.get<FinancesSummary>(`${this.apiUrl}/type/${type}`);
  }

  create(movement: CreateMovement): Observable<Movement> {
    return this.http.post<Movement>(this.apiUrl, movement);
  }
}
