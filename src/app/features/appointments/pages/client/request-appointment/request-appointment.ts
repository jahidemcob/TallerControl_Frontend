import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AppointmentFacade } from '../../../services/appointment.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';

import { Service } from '../../../../services/models/service.model';
import { Motorbike } from '../../../../motorbikes/models/motorbike.model';
import {
  CreateAppointmentDto,
  CreateAppointmentDetailDto,
  AppointmentErrors, 
} from '../../../models/appointment.model';

@Component({
  selector: 'app-request-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-appointment.html',
  styleUrl: './request-appointment.css',
})
export class RequestAppointmentComponent implements OnInit {
  services: Service[] = [];
  motorbikes: Motorbike[] = [];
  selectedServices: { service: Service; precioUnitario: number }[] = [];

  idMotoSelected: number = 0;
  fechaCita: string = '';
  horaCita: string = '';
  minFecha: string = '';
  errores: AppointmentErrors = {};

  horasDisponibles: string[] = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  private readonly appointmentFacade = inject(AppointmentFacade);
  private readonly servicesFacade = inject(ServicesFacade);
  private readonly motorbikeFacade = inject(MotorbikeFacade);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.minFecha = manana.toISOString().split('T')[0];

    this.loadServices();
    this.loadMotorbikes();
  }

  loadServices() {
    this.servicesFacade.getServiciosActivos().subscribe({
      next: (data) => {
        this.services = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  loadMotorbikes() {
    this.motorbikeFacade.getMotorbikes().subscribe({
      next: (data) => {
        this.motorbikes = data.filter((m) => m.activo);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  isSelected(service: Service): boolean {
    return this.selectedServices.some((s) => s.service.idServicio === service.idServicio);
  }

  toggleService(service: Service) {
    if (this.isSelected(service)) {
      this.selectedServices = this.selectedServices.filter(
        (s) => s.service.idServicio !== service.idServicio,
      );
    } else {
      this.selectedServices.push({ service, precioUnitario: service.precioBase });
    }
    this.cdr.detectChanges();
  }

  get total(): number {
    return this.selectedServices.reduce((sum, s) => sum + s.precioUnitario, 0);
  }

  removeService(idServicio: number) {
    this.selectedServices = this.selectedServices.filter(
      (s) => s.service.idServicio !== idServicio,
    );
    this.cdr.detectChanges();
  }

  solicitarCita() {
    this.errores = {};

    if (!this.idMotoSelected) {
      this.errores.general = 'Debes seleccionar una motocicleta.';
      return;
    }
    if (!this.fechaCita) {
      this.errores.general = 'Debes seleccionar una fecha.';
      return;
    }
    if (!this.horaCita) {
      this.errores.general = 'Debes seleccionar una hora.';
      return;
    }
    if (this.selectedServices.length === 0) {
      this.errores.general = 'Debes agregar al menos un servicio.';
      return;
    }

    const detalles: CreateAppointmentDetailDto[] = this.selectedServices.map((s) => ({
      idServicio: s.service.idServicio,
      precioUnitario: s.precioUnitario,
    }));

    const dto: CreateAppointmentDto = {
      idMoto: this.idMotoSelected,
      fechaCita: this.fechaCita,
      horaCita: this.horaCita + ':00',
      detalles,
    };

    this.appointmentFacade.createAppointment(dto).subscribe({
      next: () => this.router.navigate(['/cliente/citas']),
      error: (err) => {
        this.errores = this.appointmentFacade.mapBackendErrors(err);
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_: number, item: Service) {
    return item.idServicio;
  }
}
