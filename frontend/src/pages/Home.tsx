import { signOut } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { getFirebaseAuth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { obtenerUsuarioPorUid } from '../services/usuarioService';
import type { Usuario, Estudiante } from '../types/entities';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import StudentCard from '../components/home/StudentCard';

const HomeContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const history = useHistory();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await obtenerUsuarioPorUid(user.uid);
        if (cancelled) return;
        setUsuario(data);
      } catch (err: any) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setError('Perfil no encontrado. Por favor, completa tu información en la sección de Perfil.');
        } else {
          const message = err instanceof Error ? err.message : 'Error al cargar el perfil';
          setError(message);
        }
        setUsuario(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const logout = async () => {
    await signOut(getFirebaseAuth());
    history.replace('/login');
  };

  const handleEditarPerfil = () => {
    history.push('/perfil');
  };

  const handleRevisarAsignaturas = () => {
    history.push('/asignaturas');
  };

  // Convertir Usuario a formato compatible con StudentCard
  const estudianteCompatible: Estudiante | null = usuario ? {
    codigo: usuario.codigo || '-',
    nombres: usuario.nombres || 'Sin nombre',
    apellidos: '',
    beneficios_promedio: usuario.beca_promedio || 4.0,
    beneficios_cumple: usuario.beca_cumple || false,
    promedio_semestral: usuario.promedio || 0,
    usuario_uid: usuario.uid,
  } : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={logout} aria-label="Cerrar sesión">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="app-main-narrow app-space-y-4">
          {(loading || authLoading) && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          {estudianteCompatible && !loading && !authLoading && (
            <StudentCard estudiante={estudianteCompatible} />
          )}

          <div className="app-grid-2">
            <IonButton expand="block" fill="outline" onClick={handleEditarPerfil}>
              Editar perfil
            </IonButton>
            <IonButton expand="block" onClick={handleRevisarAsignaturas}>
              Revisar asignaturas
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const Home: React.FC = () => (
  <ProtectedRoute>
    <HomeContent />
  </ProtectedRoute>
);

export default Home;
