import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AppointmentFacade } from '../../../services/appointment.facade';
import { MotorbikeFacade } from '../../../../motorbikes/services/motorbike.facade';
import { ServicesFacade } from '../../../../services/services/service.facade';
import { Appointment, AppointmentState } from '../../../models/appointment.model';
import { Motorbike } from '../../../../motorbikes/models/motorbike.model';
import { Service } from '../../../../services/models/service.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css',
})
export class MyAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  motorbikes: Motorbike[] = [];
  services: Service[] = [];
  filtroEstado: AppointmentState | 'Todas' = 'Todas';
  errorMsg: string = '';

  estados: (AppointmentState | 'Todas')[] = [
    'Todas',
    'Pendiente',
    'Agendada',
    'EnProceso',
    'Completada',
    'Rechazada',
  ];

  private readonly facade = inject(AppointmentFacade);
  private readonly motorbikeFacade = inject(MotorbikeFacade);
  private readonly servicesFacade = inject(ServicesFacade);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    forkJoin({
      motos: this.motorbikeFacade.getMotorbikes(),
      servicios: this.servicesFacade.getServicios(),
    }).subscribe({
      next: ({ motos, servicios }) => {
        this.motorbikes = motos;
        this.services = servicios;
        this.loadAppointments();
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los datos. Intenta de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }

  loadAppointments() {
    this.facade.getByUserFull().subscribe({
      next: (data) => {
        // Asumiendo que el backend las trae de la más antigua a la más nueva.
        // Si vienen al revés, puedes aplicar un .reverse() para que la primera de todas sea la #1.
        this.appointments = data;
        this.errorMsg = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar las citas. Intenta de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }

  get appointmentsFiltradas(): Appointment[] {
    if (this.filtroEstado === 'Todas') return this.appointments;
    return this.appointments.filter((a) => a.estadoCita === this.filtroEstado);
  }

  getIdVisual(idPedido: number): number {
    // CORRECCIÓN: se elimina la condición negada, usando valor por defecto con ??
    const index = this.appointments.findIndex((a) => a.idPedido === idPedido);
    return index >= 0 ? index + 1 : 1;
  }

  cambiarFiltro(estado: AppointmentState | 'Todas') {
    this.filtroEstado = estado;
    this.cdr.detectChanges(); // Respuesta inmediata al cambiar de pestaña
  }

  getLabelEstado(estado: AppointmentState | 'Todas'): string {
    return estado === 'EnProceso' ? 'En Proceso' : estado;
  }

  getNombreMoto(idMoto: number): string {
    const moto = this.motorbikes.find((m) => m.idMoto === idMoto);
    return moto ? `${moto.marca} ${moto.modelo}` : `Moto #${idMoto}`;
  }

  getNombreServicio(idServicio: number): string {
    const servicio = this.services.find((s) => s.idServicio === idServicio);
    return servicio ? servicio.nombreServicio : `Servicio #${idServicio}`;
  }

  solicitarCita() {
    this.router.navigate(['/cliente/citas/solicitar']);
  }

  trackById(_: number, item: Appointment) {
    return item.idPedido;
  }
}
