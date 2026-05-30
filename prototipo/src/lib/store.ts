import type { Asignatura, Estudiante, Evaluacion } from "./types";

const KEY = (uid: string, k: string) => `app:${uid}:${k}`;

function read<T>(uid: string, k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY(uid, k));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(uid: string, k: string, v: T) {
  localStorage.setItem(KEY(uid, k), JSON.stringify(v));
}

// Estudiante
export function getEstudiante(uid: string, correo: string): Estudiante {
  const e = read<Estudiante | null>(uid, "estudiante", null);
  if (e) return e;
  const nuevo: Estudiante = {
    codigo: Date.now() % 1_000_000,
    nombres: "",
    apellidos: "",
    beneficios_promedio: 4.0,
    beneficios_cumple: false,
    promedio_semestral: 0,
    usuario_id: Math.abs(hashCode(correo)),
  };
  write(uid, "estudiante", nuevo);
  return nuevo;
}

export function saveEstudiante(uid: string, e: Estudiante) {
  write(uid, "estudiante", e);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}

// Asignaturas
export function getAsignaturas(uid: string): Asignatura[] {
  return read<Asignatura[]>(uid, "asignaturas", []);
}
export function saveAsignaturas(uid: string, list: Asignatura[]) {
  write(uid, "asignaturas", list);
}
export function nextAsignaturaId(uid: string): number {
  const list = getAsignaturas(uid);
  return list.length ? Math.max(...list.map((a) => a.id)) + 1 : 1;
}

// Evaluaciones
export function getEvaluaciones(uid: string): Evaluacion[] {
  return read<Evaluacion[]>(uid, "evaluaciones", []);
}
export function saveEvaluaciones(uid: string, list: Evaluacion[]) {
  write(uid, "evaluaciones", list);
}
export function nextEvaluacionId(uid: string): number {
  const list = getEvaluaciones(uid);
  return list.length ? Math.max(...list.map((e) => e.id)) + 1 : 1;
}

// Cálculos
export function calcPromedioAsignatura(evals: Evaluacion[]): number {
  if (!evals.length) return 0;
  const total = evals.reduce((acc, e) => acc + (e.nota * e.porcentaje) / 100, 0);
  return Math.round(total * 100) / 100;
}

export function recomputeAsignaturas(uid: string) {
  const asigs = getAsignaturas(uid);
  const evals = getEvaluaciones(uid);
  const updated = asigs.map((a) => {
    const evs = evals.filter((e) => e.asignatura_id === a.id);
    const prom = calcPromedioAsignatura(evs);
    return { ...a, promedio: prom, aprueba: prom >= 3.0 };
  });
  saveAsignaturas(uid, updated);

  // Update estudiante promedio semestral (ponderado por créditos)
  const est = read<Estudiante | null>(uid, "estudiante", null);
  if (est) {
    const totalCred = updated.reduce((s, a) => s + a.creditos, 0);
    const prom = totalCred
      ? Math.round(
          (updated.reduce((s, a) => s + a.promedio * a.creditos, 0) / totalCred) * 100,
        ) / 100
      : 0;
    const next: Estudiante = {
      ...est,
      promedio_semestral: prom,
      beneficios_cumple: prom >= est.beneficios_promedio,
    };
    write(uid, "estudiante", next);
  }
}