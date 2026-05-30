import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { loadEstudianteForUser, registerBackendProfile } from '../services/profileSyncService';
import type { Estudiante } from '../types/entities';

export function useEstudiante(user: User | null) {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setEstudiante(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMissingProfile(false);

    (async () => {
      try {
        const data = await loadEstudianteForUser(user);
        if (cancelled) return;

        if (data) {
          setEstudiante(data);
          return;
        }

        // Si el login fue correcto pero el perfil del backend no existe para este dispositivo,
        // lo creamos a partir del usuario autenticado de Firebase.
        const created = await registerBackendProfile(user);
        if (cancelled) return;

        setEstudiante(created);
        setMissingProfile(false);
      } catch (err: unknown) {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : 'Error al cargar el perfil';
        setError(message);
        setMissingProfile(true);
        setEstudiante(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { estudiante, loading, error, missingProfile };
}
