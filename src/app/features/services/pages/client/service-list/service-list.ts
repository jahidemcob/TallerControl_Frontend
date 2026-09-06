import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Service } from '../../../models/service.model';
import { ServicesFacade } from '../../../services/service.facade';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList implements OnInit {
  services: Service[] = [];

  private readonly facade = inject(ServicesFacade);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.facade.getServiciosActivos().subscribe({
      next: (data) => {
        this.services = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  trackById(index: number, item: Service) {
    return item.idServicio;
  }
}
