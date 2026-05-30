/** En dev Vite hace proxy de /api al backend; en build usa VITE_API_URL. */
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3000');
