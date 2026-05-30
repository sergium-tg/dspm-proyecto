import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';
import LoginForm from '../components/login/LoginForm';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const history = useHistory();
  const login = useLogin();

  useEffect(() => {
    if (!loading && user) {
      history.replace('/home');
    }
  }, [user, loading, history]);

  if (loading || user) {
    return (
      <IonPage>
        <IonContent>
          <div className="app-page-centered">
            <p className="app-muted">Entrando…</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="app-login-page" fullscreen>
        <div className="app-page-centered">
          <LoginForm
            mode={login.mode}
            title={login.title}
            email={login.email}
            password={login.password}
            nombres={login.nombres}
            codigo={login.codigo}
            busy={login.busy}
            error={login.error}
            success={login.success}
            submitLabel={login.submitLabel}
            onEmailChange={login.setEmail}
            onPasswordChange={login.setPassword}
            onNombresChange={login.setNombres}
            onCodigoChange={login.setCodigo}
            onSubmit={login.submit}
            onModeChange={login.setMode}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
