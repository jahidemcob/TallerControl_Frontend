export type AppointmentState = 'Pendiente' | 'Agendada' | 'EnProceso' | 'Completada' | 'Rechazada';

// Respuestas del backend
export interface AppointmentDetail {
  idDetalle: number;
  idServicio: number;
  precioUnitario: number;
  subTotal: number;
}

export interface Appointment {
  idPedido: number;
  idUsuario: number;
  nombreCliente: string;
  idEmpleado?: number;
  nombreEmpleado?: string;
  idMoto: number;
  fechaCreacionCita: string;
  fechaCita: string;
  horaCita: string;
  total: number;
  estadoCita: AppointmentState;
  detalles: AppointmentDetail[];
}

export interface AppointmentSummary {
  idPedido: number;
  idMoto: number;
  nombreCliente: string;
  nombreEmpleado?: string;
  fechaCita: string;
  horaCita: string;
  total: number;
  estadoCita: AppointmentState;
}

// DTOs de entrada
export interface CreateAppointmentDetailDto {
  idServicio: number;
  precioUnitario: number;
}

export interface CreateAppointmentDto {
  idMoto: number;
  fechaCita: string;
  horaCita: string;
  detalles: CreateAppointmentDetailDto[];
}

export interface AssignEmployeeDto {
  idUsuario: number;
}

export interface UpdateAppointmentStateDto {
  nuevoEstado: AppointmentState;
}

// Errores
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export interface AppointmentErrors {
  general?: string;
}
