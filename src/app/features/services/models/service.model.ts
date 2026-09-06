// listar servicios
export interface Service {
  idServicio: number;
  nombreServicio: string;
  descripcion: string;
  precioBase: number;
  isActive: boolean;
} 
 
//crear servicios
export interface CreateService {
  nombreServicio: string;
  descripcion: string;
  precioBase: number;
}

//editar servicios
export interface UpdateService {
  idServicio: number;
  nombreServicio: string;
  descripcion: string;
  precioBase: number;
}
