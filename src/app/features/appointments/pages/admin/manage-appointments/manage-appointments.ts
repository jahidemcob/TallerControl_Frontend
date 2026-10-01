import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppointmentListBase } from '../../../../../shared/base/appointment-list.base';
import { AppointmentDetailPanelComponent } from '../../../../../shared/components/appointment-detail-panel/appointment-detail-panel.component';
import { UsuarioFacade } from '../../../../users/services/user.facade';
import { AppointmentState } from '../../../models/appointment.model';
import { Usuario } from '../../../../users/models/user.model';

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentDetailPanelComponent],
  templateUrl: './manage-appointments.html',
  styleUrl: './manage-appointments.css',
})
export class ManageAppointmentsComponent extends AppointmentListBase {
  override estados: (AppointmentState | 'Todas')[] = [
    'Todas',
    'Pendiente',
    'Agendada',
    'EnProceso',
    'Completada',
    'Rechazada',
  ];

  assigningId: number | null = null;
  employees: Usuario[] = [];
  loadingEmployees = false;
  selectedEmployeeId: number | null = null;

  private readonly usuarioFacade = inject(UsuarioFacade);

  override loadAppointments(): void {
    this.facade.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loadMotorbikes(data);
      },
      error: (err) => console.error(err),
    });
  }

  abrirAsignar(idPedido: number): void {
    this.assigningId = idPedido;
    this.selectedEmployeeId = null;
    this.employees = [];
    this.loadingEmployees = true;
    this.cdr.detectChanges();

    this.usuarioFacade.getUsuarios().subscribe({
      next: (users) => {
        this.employees = users.filter((u) => u.idRol === 2 && u.activo);
        this.loadingEmployees = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingEmployees = false;
        this.cdr.detectChanges();
      },
    });
  }

  cerrarAsignar(): void {
    this.assigningId = null;
    this.selectedEmployeeId = null;
    this.cdr.detectChanges();
  }

  confirmarAsignar(): void {
    if (!this.assigningId || !this.selectedEmployeeId) return;

    const id = this.assigningId;
    const emp = this.employees.find((e) => e.idUsuario === this.selectedEmployeeId);

    this.appointments = this.appointments.map((app) =>
      app.idPedido === id
        ? {
            ...app,
            estadoCita: 'Agendada' as AppointmentState,
            nombreEmpleado: emp?.nombre ?? app.nombreEmpleado,
          }
        : app,
    );

    if (this.selectedAppointment?.idPedido === id) {
      this.selectedAppointment = {
        ...this.selectedAppointment,
        estadoCita: 'Agendada',
        idEmpleado: emp?.idUsuario,
        nombreEmpleado: emp?.nombre ?? this.selectedAppointment.nombreEmpleado,
      };
    }

    this.loadingIds.push(id);
    this.assigningId = null;
    this.cdr.detectChanges();

    this.facade.assignEmployee(id, { idUsuario: this.selectedEmployeeId }).subscribe({
      next: (updated) => {
        this.appointmentCache.set(id, updated);
        this.appointments = this.appointments.map((app) =>
          app.idPedido === id
            ? { ...app, estadoCita: updated.estadoCita, nombreEmpleado: updated.nombreEmpleado }
            : app,
        );
        if (this.selectedAppointment?.idPedido === id) {
          this.selectedAppointment = updated;
        }
        this.loadingIds = this.loadingIds.filter((i) => i !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.appointments = this.appointments.map((app) =>
          app.idPedido === id
            ? { ...app, estadoCita: 'Pendiente' as AppointmentState, nombreEmpleado: undefined }
            : app,
        );
        if (this.selectedAppointment?.idPedido === id) this.selectedAppointment = null;
        this.loadingIds = this.loadingIds.filter((i) => i !== id);
        this.cdr.detectChanges();
      },
    });
  }

  rechazar(idPedido: number): void {
    if (this.loadingIds.includes(idPedido)) return;

    const estadoAnterior = this.appointments.find((a) => a.idPedido === idPedido)?.estadoCita;

    this.appointments = this.appointments.map((app) =>
      app.idPedido === idPedido ? { ...app, estadoCita: 'Rechazada' as AppointmentState } : app,
    );

    if (this.selectedAppointment?.idPedido === idPedido) this.selectedAppointment = null;

    this.loadingIds.push(idPedido);
    this.cdr.detectChanges();

    this.facade.updateState(idPedido, 'Rechazada').subscribe({
      next: (updated) => {
        this.appointmentCache.set(idPedido, updated);
        this.appointments = this.appointments.map((app) =>
          app.idPedido === idPedido ? { ...app, estadoCita: updated.estadoCita } : app,
        );
        this.loadingIds = this.loadingIds.filter((i) => i !== idPedido);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.appointments = this.appointments.map((app) =>
          app.idPedido === idPedido
            ? { ...app, estadoCita: estadoAnterior ?? ('Pendiente' as AppointmentState) }
            : app,
        );
        this.loadingIds = this.loadingIds.filter((i) => i !== idPedido);
        this.cdr.detectChanges();
      },
    });
  }
}
