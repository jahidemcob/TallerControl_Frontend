// listar motos
export interface Motorbike {
  idMoto: number;
  idUsuario: number;
  marca: string; 
  modelo: string;
  placa: string;
  cilindraje: number;
  anio: number;
  activo: boolean;
}

//crear moto
export interface CreateMotorbike {
  idUsuario?: number;
  marca: string;
  modelo: string;
  placa: string;
  cilindraje: number;
  anio: number;
}

//editar moto
export interface UpdateMotorbike {
    idMoto: number;
    marca: string;
    modelo: string;
    cilindraje: number;
    anio: number;
}
