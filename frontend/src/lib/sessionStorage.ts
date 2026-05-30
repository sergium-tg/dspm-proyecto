const codigoKey = (uid: string) => `app:${uid}:codigo`;
const usuarioIdKey = (uid: string) => `app:${uid}:usuario_id`;

export function getStoredCodigo(uid: string): string | null {
  const raw = localStorage.getItem(codigoKey(uid));
  if (!raw) return null;
  return raw;
}

export function setStoredCodigo(uid: string, codigo: string): void {
  localStorage.setItem(codigoKey(uid), codigo);
}

export function getStoredUsuarioId(uid: string): number | null {
  const raw = localStorage.getItem(usuarioIdKey(uid));
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setStoredUsuarioId(uid: string, usuarioId: number): void {
  localStorage.setItem(usuarioIdKey(uid), String(usuarioId));
}

export function generateCodigo(): string {
  return String(Date.now() % 1_000_000);
}
