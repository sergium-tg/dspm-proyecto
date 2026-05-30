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
  <IonCard className="app-card app-max-w-sm">
    <IonCardContent className="app-card-content app-space-y-5">
      <div className="app-space-y-1">
        <h1 className="app-text-2xl app-font-semibold app-tracking-tight">{title}</h1>
        <p className="app-text-sm app-text-muted-foreground">
          {mode === 'reset'
            ? 'Te enviaremos un correo para restablecer tu contraseña.'
            : 'Gestiona tus asignaturas y evaluaciones.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="app-space-y-4">
        {mode === 'register' && onNombresChange && (
          <div className="app-field">
            <label htmlFor="register-nombre" className="app-field-label">Nombres</label>
            <IonInput
              id="register-nombre"
              className="app-input-base"
              type="text"
              value={nombres}
              onIonInput={(e) => onNombresChange(e.detail.value ?? '')}
              required
              autocomplete="name"
            />
          </div>
        )}

        <div className="app-field">
          <label htmlFor="login-email" className="app-field-label">Correo</label>
          <IonInput
            id="login-email"
            className="app-input-base"
            type="email"
            value={email}
            onIonInput={(e) => onEmailChange(e.detail.value ?? '')}
            required
            autocomplete="email"
          />
        </div>

        {mode !== 'reset' && (
          <div className="app-field">
            <label htmlFor="login-password" className="app-field-label">Contraseña</label>
            <IonInput
              id="login-password"
              className="app-input-base"
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
          <div className="app-field">
            <label htmlFor="register-codigo" className="app-field-label">Código</label>
            <IonInput
              id="register-codigo"
              className="app-input-base"
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

        <IonButton expand="block" type="submit" className="app-button-base app-button-primary" disabled={busy}>
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
