import { actualizarAsignatura, obtenerAsignaturas } from './asignaturaService';
import { obtenerNotas } from './notaService';
import { actualizarUsuario, obtenerUsuarioPorUid } from './usuarioService';
import type { Asignatura } from '../types/entities';

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function calcPromedioAsignatura(notas: { porcentaje: number; calificacion: number }[]): number {
  const total = notas.reduce(
    (sum, nota) => sum + (Number(nota.calificacion) * Number(nota.porcentaje)) / 100,
    0,
  );
  return roundToTwo(total);
}

function calcPromedioUsuario(asignaturas: Asignatura[]): number {
  const totalCreditos = asignaturas.reduce((sum, asignatura) => sum + Number(asignatura.creditos || 0), 0);
  if (!totalCreditos) return 0;

  const totalPonderado = asignaturas.reduce(
    (sum, asignatura) => sum + Number(asignatura.promedio || 0) * Number(asignatura.creditos || 0),
    0,
  );

  return roundToTwo(totalPonderado / totalCreditos);
}

export async function sincronizarResumenAcademico(userUid: string): Promise<Asignatura[]> {
  const asignaturas = await obtenerAsignaturas();

  const sincronizadas = await Promise.all(
    asignaturas.map(async (asignatura) => {
      const notas = await obtenerNotas(asignatura.id);
      const promedio = calcPromedioAsignatura(notas);
      const aprueba = promedio >= 3.0;

      if (asignatura.promedio === promedio && asignatura.aprueba === aprueba) {
        return asignatura;
      }

      return actualizarAsignatura(asignatura.id, { promedio, aprueba });
    }),
  );

  const promedioUsuario = calcPromedioUsuario(sincronizadas);
  const usuario = await obtenerUsuarioPorUid(userUid);
  const becaCumple = promedioUsuario >= Number(usuario.beca_promedio || 0);

  if (usuario.promedio !== promedioUsuario || usuario.beca_cumple !== becaCumple) {
    await actualizarUsuario(userUid, {
      promedio: promedioUsuario,
      beca_cumple: becaCumple,
    });
  }

  return sincronizadas;
}
