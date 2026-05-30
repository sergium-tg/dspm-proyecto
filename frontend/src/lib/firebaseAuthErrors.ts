/** Mensajes en español para errores comunes de Firebase Auth. */
export function getFirebaseAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';

  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/user-not-found':
      return 'No hay una cuenta con ese correo en Firebase. Regístrate primero o revisa que esté escrito igual.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado. Inicia sesión o restablece la contraseña.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    default:
      return err instanceof Error ? err.message : 'Ocurrió un error. Inténtalo de nuevo.';
  }
}
