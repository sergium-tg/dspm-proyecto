import {
  IonButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonNote,
  IonText,
} from '@ionic/react';
import type { LoginMode } from '../../hooks/useLogin';

export interface LoginFormProps {
  mode: LoginMode;
  title: string;
  email: string;
  password: string;
  nombres?: string;
  codigo?: string;
  busy: boolean;
  error: string | null;
  success: string | null;
  submitLabel: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNombresChange?: (value: string) => void;
  onCodigoChange?: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeChange: (mode: LoginMode) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  title,
  email,
  password,
  nombres,
  codigo,
  busy,
  error,
  success,
  submitLabel,
  onEmailChange,
  onPasswordChange,
  onNombresChange,
  onCodigoChange,
  onSubmit,
  onModeChange,
}) => (
  <IonCard className="app-card">
    <IonCardContent className="app-space-y-5">
      <div className="app-login-header">
        <h1 className="app-title-lg">{title}</h1>
        <p className="app-muted" style={{ margin: 0 }}>
          {mode === 'reset'
            ? 'Te enviaremos un correo para restablecer tu contraseña.'
            : 'Gestiona tus asignaturas y evaluaciones.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="app-space-y-4 app-login-form">
        {mode === 'register' && onNombresChange && (
          <div className="app-login-field">
            <label htmlFor="register-nombre">Nombres</label>
            <IonInput
              id="register-nombre"
              className="app-input"
              fill="outline"
              type="text"
              value={nombres}
              onIonInput={(e) => onNombresChange(e.detail.value ?? '')}
              required
              autocomplete="name"
            />
          </div>
        )}

        <div className="app-login-field">
          <label htmlFor="login-email">Correo</label>
          <IonInput
            id="login-email"
            className="app-input"
            fill="outline"
            type="email"
            value={email}
            onIonInput={(e) => onEmailChange(e.detail.value ?? '')}
            required
            autocomplete="email"
          />
        </div>

        {mode !== 'reset' && (
          <div className="app-login-field">
            <label htmlFor="login-password">Contraseña</label>
            <IonInput
              id="login-password"
              className="app-input"
              fill="outline"
              type="password"
              value={password}
              onIonInput={(e) => onPasswordChange(e.detail.value ?? '')}
              required
              minlength={6}
              autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
        )}

        {mode === 'register' && onCodigoChange && (
          <div className="app-login-field">
            <label htmlFor="register-codigo">Código</label>
            <IonInput
              id="register-codigo"
              className="app-input"
              fill="outline"
              type="text"
              value={codigo}
              onIonInput={(e) => onCodigoChange(e.detail.value ?? '')}
              required
            />
          </div>
        )}

        {error && (
          <IonNote color="danger" className="app-login-message">
            <IonText color="danger">{error}</IonText>
          </IonNote>
        )}

        {success && (
          <IonNote color="success" className="app-login-message">
            <IonText color="success">{success}</IonText>
          </IonNote>
        )}

        <IonButton expand="block" type="submit" className="app-submit" disabled={busy}>
          {busy ? 'Procesando…' : submitLabel}
        </IonButton>
      </form>

      <div className="app-link-row">
        {mode !== 'login' ? (
          <button type="button" onClick={() => onModeChange('login')}>
            Volver al login
          </button>
        ) : (
          <>
            <button type="button" onClick={() => onModeChange('register')}>
              Crear cuenta
            </button>
            <button type="button" onClick={() => onModeChange('reset')}>
              Restablecer contraseña
            </button>
          </>
        )}
      </div>
    </IonCardContent>
  </IonCard>
);

export default LoginForm;
