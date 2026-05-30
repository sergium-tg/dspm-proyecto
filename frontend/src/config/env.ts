/** Usa VITE_API_URL tanto en dev como en build para el backend en la nube. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
