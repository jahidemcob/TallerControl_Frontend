import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Service, CreateService, UpdateService } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private readonly httpClient = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/services`;

  getAllServices(): Observable<Service[]> {
    return this.httpClient.get<Service[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<Service> {
    return this.httpClient.get<Service>(`${this.apiUrl}/${id}`);
  }

  createService(service: CreateService): Observable<Service> {
    return this.httpClient.post<Service>(this.apiUrl, service);
  }

  updateService(service: UpdateService): Observable<{ message: string }> {
    return this.httpClient.put<{ message: string }>(
      `${this.apiUrl}/${service.idServicio}`,
      service,
    );
  }

  toggleServiceStatus(id: number): Observable<{ message: string; status: boolean }> {
    return this.httpClient.patch<{ message: string; status: boolean }>(
      `${this.apiUrl}/${id}/disable`,
      {},
    );
  }

  getActiveServices(): Observable<Service[]> {
    return this.httpClient.get<Service[]>(`${this.apiUrl}?onlyActive=true`);
  }
}
