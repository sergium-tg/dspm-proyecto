import { apiClient } from './apiClient';
import type { Nota } from '../types/entities';

export interface CrearNotaResponse {
  message: string;
  data: Nota;
}

export async function obtenerNotas(idAsignatura: string): Promise<Nota[]> {
  const { data } = await apiClient.get<Nota[]>(`/api/asignaturas/${idAsignatura}/notas`);
  return data;
}

export async function agregarNota(
  idAsignatura: string,
  nota: Omit<Nota, 'id'>
): Promise<Nota> {
  const { data } = await apiClient.post<CrearNotaResponse>(
    `/api/asignaturas/${idAsignatura}/notas`,
    nota,
  );
  return data.data;
}

export async function actualizarNota(
  idAsignatura: string,
  idNota: string,
  nota: Partial<Nota>
): Promise<Nota> {
  const { data } = await apiClient.patch<{ message: string; data: Nota }>(
    `/api/asignaturas/${idAsignatura}/notas/${idNota}`,
    nota,
  );
  return data.data;
}

export async function eliminarNota(idAsignatura: string, idNota: string): Promise<void> {
  await apiClient.delete(`/api/asignaturas/${idAsignatura}/notas/${idNota}`);
}
