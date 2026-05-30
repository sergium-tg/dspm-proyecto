import { apiClient } from './apiClient';
import type { CrearUsuarioResponse, Usuario } from '../types/entities';

export async function crearUsuario(
  uid: string,
  nombres: string,
  correo: string,
  rol: string = 'estudiante',
  codigo: string
): Promise<Usuario> {
  const { data } = await apiClient.post<CrearUsuarioResponse>('/api/usuarios', {
    uid,
    nombres,
    correo,
    rol,
    codigo,
  });
  return data.data;
}

export async function obtenerUsuarioPorUid(uid: string): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>(`/api/usuarios/perfil`);
  return data;
}

export async function actualizarUsuario(
  uid: string,
  datos: Partial<Omit<Usuario, 'uid' | 'correo' | 'rol'>>
): Promise<Usuario> {
  const { data } = await apiClient.patch<Usuario>(`/api/usuarios/perfil`, datos);
  return data;
}
