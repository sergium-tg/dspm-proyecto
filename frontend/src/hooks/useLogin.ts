import { useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';
import { getFirebaseAuthErrorMessage } from '../lib/firebaseAuthErrors';
import { crearUsuario } from '../services/usuarioService';

export type LoginMode = 'login' | 'register' | 'reset';

export function useLogin() {
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setBusy(true);
      setError(null);
      setSuccess(null);
      const auth = getFirebaseAuth();
      const emailTrimmed = email.trim();
      const passwordTrimmed = password.trim();
      try {
        if (mode === 'login') {
          await signInWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
        } else if (mode === 'register') {
          // Paso 1: Autenticación con Firebase Auth
          const cred = await createUserWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
          const uid = cred.user.uid;

          // Paso 2: Sincronización con Backend
          try {
            await crearUsuario(
              uid,
              nombres.trim(),
              emailTrimmed,
              'estudiante',
              codigo.trim(),
            );
          } catch (syncErr) {
            // Si falla la sincronización con el backend, mostrar error específico
            setError(
              'Error al sincronizar con el servidor. Por favor, contacta al soporte técnico.',
            );
            throw syncErr;
          }
        } else {
          // Firebase no revela si el correo existe (anti-enumeración): siempre intentamos enviar.
          await sendPasswordResetEmail(auth, emailTrimmed);
          setSuccess(
            'Si el correo está registrado en Firebase, recibirás un enlace en unos minutos. Revisa también spam y promociones.',
          );
          setMode('login');
        }
      } catch (err) {
        setError(getFirebaseAuthErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [mode, email, password, nombres, codigo],
  );

  const title =
    mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Restablecer';

  const submitLabel =
    mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Registrar' : 'Enviar correo';

  const changeMode = useCallback((next: LoginMode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    mode,
    setMode: changeMode,
    email,
    setEmail,
    password,
    setPassword,
    nombres,
    setNombres,
    codigo,
    setCodigo,
    busy,
    error,
    success,
    setError,
    submit,
    title,
    submitLabel,
  };
}
