export interface Usuario {
  uid: string;
  nombres: string;
  correo: string;
  rol: string;
  codigo: string;
  beca_promedio: number;
  beca_cumple: boolean;
  promedio: number;
}

export interface Estudiante {
  codigo: string;
  nombres: string;
  apellidos: string;
  beneficios_promedio: number;
  beneficios_cumple: boolean;
  promedio_semestral: number;
  usuario_uid: string;
}

export interface CrearUsuarioResponse {
  message: string;
  data: Usuario;
}

export interface CrearEstudianteResponse {
  message: string;
  data: Estudiante;
}

export interface Asignatura {
  id: string;
  descripcion: string;
  creditos: number;
  promedio: number;
  aprueba: boolean;
}

export interface CrearAsignaturaResponse {
  message: string;
  data: Asignatura;
}

export interface Nota {
  id: string;
  descripcion: string;
  porcentaje: number;
  calificacion: number;
}
