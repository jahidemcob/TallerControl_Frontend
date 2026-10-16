import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Motorbike, CreateMotorbike, UpdateMotorbike } from '../models/motorbike.model';

@Injectable({
  providedIn: 'root',
})
export class MotorbikeService {
  private readonly httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/Motorbike`;

  getAllMotorbikes(): Observable<Motorbike[]> {
    return this.httpClient.get<Motorbike[]>(this.apiUrl);
  }

  getMotorbikeById(id: number): Observable<Motorbike> {
    return this.httpClient.get<Motorbike>(`${this.apiUrl}/${id}`);
  }

  createMotorbike(motorbike: CreateMotorbike): Observable<Motorbike> {
    return this.httpClient.post<Motorbike>(this.apiUrl, motorbike);
  }

  updateMotorbike(motorbike: UpdateMotorbike): Observable<{ message: string }> {
    return this.httpClient.put<{ message: string }>(
      `${this.apiUrl}/${motorbike.idMoto}`,
      motorbike,
    );
  }

  toggleMotorbikeStatus(id: number): Observable<{ message: string; status: boolean }> {
    return this.httpClient.patch<{ message: string; status: boolean }>(
      `${this.apiUrl}/${id}/disable`,
      {},
    );
  }
}
