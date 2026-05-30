import { apiClient } from './apiClient';
import type { Asignatura, CrearAsignaturaResponse } from '../types/entities';

export async function obtenerAsignaturas(): Promise<Asignatura[]> {
  const { data } = await apiClient.get<Asignatura[]>('/api/asignaturas');
  return data;
}

export async function obtenerAsignatura(id: string): Promise<Asignatura> {
  const { data } = await apiClient.get<Asignatura>(`/api/asignaturas/${id}`);
  return data;
}

export async function crearAsignatura(
  asignatura: Omit<Asignatura, 'id' | 'promedio' | 'aprueba'>
): Promise<Asignatura> {
  const { data } = await apiClient.post<CrearAsignaturaResponse>(
    '/api/asignaturas',
    asignatura,
  );
  return data.data;
}

export async function actualizarAsignatura(
  id: string,
  asignatura: Partial<Asignatura>
): Promise<Asignatura> {
  const { data } = await apiClient.patch<Asignatura>(
    `/api/asignaturas/${id}`,
    asignatura,
  );
  return data;
}

export async function eliminarAsignatura(id: string): Promise<void> {
  await apiClient.delete(`/api/asignaturas/${id}`);
}
