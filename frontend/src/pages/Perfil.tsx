import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { obtenerUsuarioPorUid, actualizarUsuario } from '../services/usuarioService';
import type { Usuario } from '../types/entities';

const Perfil: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Campos del formulario
  const [codigo, setCodigo] = useState('');
  const [nombres, setNombres] = useState('');
  const [becaPromedio, setBecaPromedio] = useState('4.0');

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
        setCodigo(data.codigo || '');
        setNombres(data.nombres || '');
        setBecaPromedio((data.beca_promedio || 4.0).toString());
      } catch (err: any) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          // Si no existe, permitimos que el usuario lo cree
          setUsuario({
            uid: user.uid,
            nombres: '',
            correo: user.email || '',
            rol: 'estudiante',
            codigo: '',
            beca_promedio: 4.0,
            beca_cumple: false,
            promedio: 0,
          });
        } else {
          const message = err instanceof Error ? err.message : 'Error al cargar el perfil';
          setError(message);
          setUsuario(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleGuardar = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const actualizado = await actualizarUsuario(user.uid, {
        nombres: nombres.trim(),
        codigo: codigo.trim(),
        beca_promedio: parseFloat(becaPromedio) || 4.0,
      });
      setUsuario(actualizado);
      setToastMessage('Perfil guardado exitosamente');
      setShowToast(true);
      setTimeout(() => {
        history.replace('/home');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el perfil';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    history.replace('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/home')} aria-label="Home">
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="app-main-narrow app-space-y-4">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <IonSpinner name="crescent" />
            </div>
          )}

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          {!loading && usuario && (
            <div className="app-card app-space-y-4" style={{ padding: '1.25rem' }}>
              <IonItem>
                <IonLabel position="floating">Código</IonLabel>
                <IonInput
                  type="text"
                  value={codigo}
                  onIonInput={(e) => setCodigo(e.detail.value ?? '')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Nombres</IonLabel>
                <IonInput
                  type="text"
                  value={nombres}
                  onIonInput={(e) => setNombres(e.detail.value ?? '')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Meta de promedio (Beca)</IonLabel>
                <IonInput
                  type="number"
                  step="0.1"
                  value={becaPromedio}
                  onIonInput={(e) => setBecaPromedio(e.detail.value ?? '')}
                />
              </IonItem>

              <div className="app-grid-2" style={{ paddingTop: '0.5rem' }}>
                <IonButton expand="block" fill="outline" onClick={handleCancelar} disabled={saving}>
                  Cancelar
                </IonButton>
                <IonButton expand="block" onClick={handleGuardar} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </IonButton>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={1500}
        position="top"
        color="success"
      />
    </IonPage>
  );
};

export default Perfil;
