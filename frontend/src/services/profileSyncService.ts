import type { User } from 'firebase/auth';
import {
  generateCodigo,
  getStoredCodigo,
  setStoredCodigo,
} from '../lib/sessionStorage';
import {
  crearEstudiante,
  buildEstudianteInicial,
  obtenerEstudiante,
  obtenerEstudiantePorUsuarioUid,
} from './estudianteService';
import { crearUsuario, obtenerUsuarioPorUid } from './usuarioService';
import type { Estudiante } from '../types/entities';

/** Called after Firebase sign-up to create backend usuario + estudiante. */
export async function registerBackendProfile(user: User): Promise<Estudiante> {
  const uid = user.uid;
  const existingCodigo = getStoredCodigo(uid);
  if (existingCodigo) {
    return obtenerEstudiante(existingCodigo);
  }

  // Verificar si el usuario ya existe en el backend
  try {
    const existingUsuario = await obtenerUsuarioPorUid(uid);
    // Si el usuario existe, intentar obtener el estudiante asociado
    try {
      const estudiante = await obtenerEstudiantePorUsuarioUid(uid);
      setStoredCodigo(uid, estudiante.codigo);
      return estudiante;
    } catch {
      // Si no tiene estudiante, crear uno
      const codigo = generateCodigo();
      const nuevo = buildEstudianteInicial(codigo, uid);
      const creado = await crearEstudiante(nuevo);
      setStoredCodigo(uid, creado.codigo);
      return creado;
    }
  } catch {
    // Si el usuario no existe, crear usuario y estudiante
    const codigo = generateCodigo();
    const nuevo = buildEstudianteInicial(codigo, uid);
    const creado = await crearEstudiante(nuevo);
    setStoredCodigo(uid, creado.codigo);
    return creado;
  }
}

/** Loads estudiante from API using codigo stored for this Firebase user. */
export async function loadEstudianteForUser(user: User): Promise<Estudiante | null> {
  const uid = user.uid;
  
  // Primero intentar obtener por código almacenado
  const storedCodigo = getStoredCodigo(uid);
  if (storedCodigo) {
    try {
      return await obtenerEstudiante(storedCodigo);
    } catch {
      // Si falla, intentar obtener por uid
    }
  }
  
  // Si no hay código almacenado o falló, intentar obtener por uid
  try {
    const estudiante = await obtenerEstudiantePorUsuarioUid(uid);
    setStoredCodigo(uid, estudiante.codigo);
    return estudiante;
  } catch {
    return null;
  }
}
