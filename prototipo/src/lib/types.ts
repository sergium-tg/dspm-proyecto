export interface Usuario {
  id: number;
  correo: string;
  password_hash: string;
}

export interface Estudiante {
  codigo: number;
  nombres: string;
  apellidos: string;
  beneficios_promedio: number;
  beneficios_cumple: boolean;
  promedio_semestral: number;
  usuario_id: number;
}

export interface Asignatura {
  id: number;
  nombre: string;
  creditos: number;
  promedio: number;
  aprueba: boolean;
  usuario_id: number;
}

export interface Evaluacion {
  id: number;
  descripcion: string;
  porcentaje: number;
  nota: number;
  asignatura_id: number;
}