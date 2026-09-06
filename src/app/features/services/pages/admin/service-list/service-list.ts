import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Service } from '../../../models/service.model';
import { ServicesFacade } from '../../../services/service.facade';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-list.html',
  styleUrls: ['./service-list.css'],
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];

  private readonly facade = inject(ServicesFacade);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.facade.getServicios().subscribe({
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

  goToCreate() {
    this.router.navigate(['/admin/servicios/crear']);
  }

  goToEdit(id: number) {
    this.router.navigate(['/admin/servicios/editar', id]);
  }

  toggleStatus(service: Service) {
    this.facade.toggleEstado(service.idServicio).subscribe({
      next: (res) => {
        service.isActive = res.status;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
}
