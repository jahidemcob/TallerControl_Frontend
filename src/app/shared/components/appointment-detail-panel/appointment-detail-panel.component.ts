import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Appointment,
  AppointmentState,
} from '../../../features/appointments/models/appointment.model';

@Component({
  selector: 'app-appointment-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-detail-panel.component.html',
  styleUrl: './appointment-detail-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailPanelComponent {
  @Input() selectedAppointment: Appointment | null = null;
  @Input() loadingDetail = false;
  @Input() panelTitle = ''; // ej: "#3" o "#1001"
  @Input() loadingIds: number[] = [];
  @Input() extraStates: AppointmentState[] = []; // estados extra para badges

  @Output() closed = new EventEmitter<void>();
  @Output() actionPrimary = new EventEmitter<number>(); // "En Proceso" o lo que el padre necesite
  @Output() actionSecondary = new EventEmitter<number>(); // "Terminado"

  // Inputs opcionales para renderizar secciones exclusivas de cada vista
  @Input() showEmpleado = false;
  @Input() showAcciones = false;

  getLabelEstado(estado: AppointmentState | 'Todas'): string {
    return estado === 'EnProceso' ? 'En Proceso' : estado;
  }

  isLoading(id: number): boolean {
    return this.loadingIds.includes(id);
  }
}
