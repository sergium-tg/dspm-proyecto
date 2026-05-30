import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (loading) return;
    history.replace(user ? '/home' : '/login');
  }, [user, loading, history]);

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
};

export default Index;
