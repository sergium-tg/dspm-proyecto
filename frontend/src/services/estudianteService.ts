import { apiClient } from './apiClient';
import type { CrearEstudianteResponse, Estudiante } from '../types/entities';

export async function obtenerEstudiante(codigo: string): Promise<Estudiante> {
  const { data } = await apiClient.get<Estudiante>(`/api/estudiantes/${codigo}`);
  return data;
}

export async function crearEstudiante(estudiante: Estudiante): Promise<Estudiante> {
  const { data } = await apiClient.post<CrearEstudianteResponse>(
    '/api/estudiantes',
    estudiante,
  );
  return data.data;
}

export async function obtenerEstudiantePorUsuarioUid(usuarioUid: string): Promise<Estudiante> {
  const { data } = await apiClient.get<Estudiante>(
    `/api/estudiantes/usuario/${usuarioUid}`,
  );
  return data;
}

export function buildEstudianteInicial(codigo: string, usuarioUid: string): Estudiante {
  return {
    codigo,
    nombres: '',
    apellidos: '',
    beneficios_promedio: 4.0,
    beneficios_cumple: false,
    promedio_semestral: 0,
    usuario_uid: usuarioUid,
  };
}
