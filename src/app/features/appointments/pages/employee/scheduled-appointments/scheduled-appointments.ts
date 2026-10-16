import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppointmentListBase } from '../../../../../shared/base/appointment-list.base';
import { AppointmentDetailPanelComponent } from '../../../../../shared/components/appointment-detail-panel/appointment-detail-panel.component';
import { AppointmentState } from '../../../models/appointment.model';

@Component({
  selector: 'app-scheduled-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentDetailPanelComponent],
  templateUrl: './scheduled-appointments.html',
  styleUrl: './scheduled-appointments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledAppointmentsComponent extends AppointmentListBase {
  override estados: (AppointmentState | 'Todas')[] = [
    'Todas',
    'Agendada',
    'EnProceso',
    'Completada',
  ];

  override loadAppointments(): void {
    this.facade.getByEmployee().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loadMotorbikes(data);
      },
      error: (err) => console.error(err),
    });
  }

  private procesarCambioEstado(
    idPedido: number,
    nuevoEstado: AppointmentState,
    onErrorCallback: (err: any) => void,
  ): void {
    if (this.loadingIds.includes(idPedido)) return;

    this.appointments = this.appointments.map((app) =>
      app.idPedido === idPedido ? { ...app, estadoCita: nuevoEstado } : app,
    );

    if (this.selectedAppointment?.idPedido === idPedido) {
      this.selectedAppointment = { ...this.selectedAppointment, estadoCita: nuevoEstado };
    }

    this.loadingIds.push(idPedido);
    this.cdr.markForCheck();

    this.facade.updateState(idPedido, nuevoEstado).subscribe({
      next: (updated) => {
        this.appointmentCache.set(idPedido, updated);
        this.appointments = this.appointments.map((app) =>
          app.idPedido === idPedido ? { ...app, estadoCita: updated.estadoCita } : app,
        );
        if (this.selectedAppointment?.idPedido === idPedido) {
          this.selectedAppointment = updated;
        }
        this.loadingIds = this.loadingIds.filter((i) => i !== idPedido);
        this.cdr.markForCheck();
      },
      error: (err) => {
        onErrorCallback(err);
        this.loadingIds = this.loadingIds.filter((i) => i !== idPedido);
        this.cdr.markForCheck();
      },
    });
  }

  enDesarrollo(idPedido: number): void {
    this.procesarCambioEstado(idPedido, 'EnProceso' as AppointmentState, (err) => {
      console.error(err);
      this.appointments = this.appointments.map((app) =>
        app.idPedido === idPedido ? { ...app, estadoCita: 'Agendada' as AppointmentState } : app,
      );
    });
  }

  terminado(idPedido: number): void {
    const estadoAnterior = this.appointments.find((a) => a.idPedido === idPedido)?.estadoCita;

    this.procesarCambioEstado(idPedido, 'Completada' as AppointmentState, (err) => {
      console.error(err);
      this.appointments = this.appointments.map((app) =>
        app.idPedido === idPedido
          ? { ...app, estadoCita: estadoAnterior ?? ('EnProceso' as AppointmentState) }
          : app,
      );
    });
  }

  getIndiceCita(idPedido: number): number {
    return this.appointmentsFiltradas.findIndex((a) => a.idPedido === idPedido) + 1;
  }
}
