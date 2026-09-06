// REQUESTS

export interface LoginRequest {
  username: string;
  clave: string;
} 

export interface RegisterRequest {
  Nombre: string;
  NombreUsuario: string;
  Telefono: string;
  Correo: string;
  Clave: string;
}

// RESPONSE DEL BACKEND

export interface AuthResponse {
  token: string;
  username?: string;
  rol?: string;
  role?: string;
  email?: string;
}

// PAYLOAD DEL JWT

export interface JwtPayload {
  role?: string;
  rol?: string;
  exp: number;
}

export interface AuthResponse {
  token: string;
  username?: string;
  rol?: string;
  role?: string;
  email?: string;
  perfilCompleto?: boolean;
  idUsuario?: number;
}
