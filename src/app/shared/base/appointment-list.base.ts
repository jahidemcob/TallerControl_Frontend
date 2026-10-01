// src/app/shared/base/appointment-list.base.ts
import { inject, ChangeDetectorRef, OnInit, Directive } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppointmentFacade } from '../../features/appointments/services/appointment.facade';
import { MotorbikeFacade } from '../../features/motorbikes/services/motorbike.facade';
import { ServicesFacade } from '../../features/services/services/service.facade';

import {
  AppointmentSummary,
  Appointment,
  AppointmentState,
} from '../../features/appointments/models/appointment.model';
import { Motorbike } from '../../features/motorbikes/models/motorbike.model';
import { Service } from '../../features/services/models/service.model';

@Directive()
export abstract class AppointmentListBase implements OnInit {
  appointments: AppointmentSummary[] = [];
  motorbikesMap: Map<number, Motorbike> = new Map();
  services: Service[] = [];
  loadingIds: number[] = [];

  protected readonly appointmentCache: Map<number, Appointment> = new Map();

  filtroEstado: AppointmentState | 'Todas' = 'Todas';
  filtroFecha = '';

  selectedAppointment: Appointment | null = null;
  loadingDetail = false;

  abstract estados: (AppointmentState | 'Todas')[];

  protected readonly facade = inject(AppointmentFacade);
  protected readonly motorbikeFacade = inject(MotorbikeFacade);
  protected readonly servicesFacade = inject(ServicesFacade);
  protected readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.servicesFacade.getServicios().subscribe({
      next: (data) => {
        this.services = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err),
    });
    this.loadAppointments();
  }

  abstract loadAppointments(): void;

  protected loadMotorbikes(data: AppointmentSummary[]): void {
    const idsNuevos = [...new Set(data.map((a) => a.idMoto))].filter(
      (id) => id && !this.motorbikesMap.has(id),
    );

    if (idsNuevos.length > 0) {
      forkJoin(
        idsNuevos.map((id) =>
          this.motorbikeFacade.getMotorbikeById(id).pipe(catchError(() => of(null))),
        ),
      ).subscribe((motos) => {
        motos.forEach((m) => {
          if (m) this.motorbikesMap.set(m.idMoto, m);
        });
        this.cdr.markForCheck();
      });
    } else {
      this.cdr.markForCheck();
    }
  }

  get appointmentsFiltradas(): AppointmentSummary[] {
    return this.appointments.filter((a) => {
      const estadoOk = this.filtroEstado === 'Todas' || a.estadoCita === this.filtroEstado;
      const fechaOk = !this.filtroFecha || a.fechaCita === this.filtroFecha;
      return estadoOk && fechaOk;
    });
  }

  cambiarFiltro(estado: AppointmentState | 'Todas'): void {
    this.filtroEstado = estado;
    if (this.selectedAppointment) this.closeDetail();
    this.cdr.markForCheck();
  }

  limpiarFecha(): void {
    this.filtroFecha = '';
    this.cdr.markForCheck();
  }

  openDetail(idPedido: number): void {
    if (this.selectedAppointment?.idPedido === idPedido) {
      this.closeDetail();
      return;
    }

    this.loadingDetail = true;
    this.selectedAppointment = null;
    this.cdr.detectChanges();

    if (this.appointmentCache.has(idPedido)) {
      this.selectedAppointment = this.appointmentCache.get(idPedido)!;
      this.loadingDetail = false;
      this.cdr.detectChanges();
      return;
    }

    this.facade.getById(idPedido).subscribe({
      next: (data) => {
        this.selectedAppointment = data;
        this.appointmentCache.set(idPedido, data);
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeDetail(): void {
    this.selectedAppointment = null;
    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  getNombreMoto(idMoto: number): string {
    const moto = this.motorbikesMap.get(idMoto);
    return moto ? `${moto.marca} ${moto.modelo}` : '—';
  }

  getNombreServicio(idServicio: number): string {
    const s = this.services.find((s) => s.idServicio === idServicio);
    return s ? s.nombreServicio : `Servicio #${idServicio}`;
  }

  getLabelEstado(estado: AppointmentState | 'Todas'): string {
    return estado === 'EnProceso' ? 'En Proceso' : estado;
  }

  isLoading(id: number): boolean {
    return this.loadingIds.includes(id);
  }

  trackById(_: number, item: AppointmentSummary): number {
    return item.idPedido;
  }
}
