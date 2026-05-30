import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!loading && !user) {
      history.replace('/login');
    }
  }, [user, loading, history]);

  if (loading || !user) {
    return (
      <IonPage>
        <IonContent>
          <div className="app-page-centered">
            <IonSpinner name="crescent" />
            <p className="app-muted" style={{ marginTop: '1rem' }}>
              Cargando…
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
