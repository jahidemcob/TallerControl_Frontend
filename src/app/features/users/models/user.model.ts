// Lo que viene del backend
export interface Usuario {
  idUsuario: number;
  idRol: number;
  nombre: string;
  nombreUsuario: string;
  telefono?: string;
  correo?: string;
  activo: boolean;
}

// Crear
export interface UsuarioCreate {  
  idRol: number; 
  nombre: string;
  nombreUsuario: string;
  clave: string;
  telefono?: string;
  correo?: string;
}

// Actualizar
export interface UsuarioUpdate {
  idUsuario: number;
  idRol: number;
  nombre: string;
  nombreUsuario: string;
  telefono?: string;
  correo?: string;
  nuevaClave?: string;
}

export interface ApiError {
  status: number;
  error: string;   
  message: string;
  timestamp: string;
}

export interface BackendErrors {
  correo?: string;
  nombreUsuario?: string;
  telefono?: string;
  general?: string;
}
