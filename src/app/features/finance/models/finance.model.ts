export type MovementType = 'Ingreso' | 'Egreso';

// Lo que viene del backend - movimiento individual
export interface Movement {
  idMovimiento: number;
  fecha: Date;
  tipoMovimiento: MovementType;
  descripcion: string;
  monto: number;
}

// Lo que viene del GET ALL (summary con total)
export interface FinancesSummary {
  movimientos: Movement[];
  total: number;
}

// Lo que se envía al crear
export interface CreateMovement {
  tipoMovimiento: MovementType;
  descripcion: string;
  monto: number;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export interface FinanceErrors {
  descripcion?: string;
  monto?: string;
  general?: string;
}
