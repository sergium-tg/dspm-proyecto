import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/react';
import { addOutline, homeOutline, trashOutline, eyeOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { obtenerAsignaturas, crearAsignatura, eliminarAsignatura } from '../services/asignaturaService';
import type { Asignatura } from '../types/entities';

const Asignaturas: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Modal para crear asignatura
  const [showModal, setShowModal] = useState(false);
  const [nuevaAsignatura, setNuevaAsignatura] = useState({ descripcion: '', creditos: 3 });

  useEffect(() => {
    if (!user) {
      setAsignaturas([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await obtenerAsignaturas();
        if (cancelled) return;
        setAsignaturas(data);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error al cargar asignaturas';
        setError(message);
        setAsignaturas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCrearAsignatura = async () => {
    if (!user) return;
    if (!nuevaAsignatura.descripcion.trim()) {
      setToastMessage('La descripción es obligatoria');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const creditosValidados = Math.min(12, Math.max(1, Math.floor(nuevaAsignatura.creditos || 3)));
      const creada = await crearAsignatura({
        descripcion: nuevaAsignatura.descripcion.trim(),
        creditos: creditosValidados,
      });
      setAsignaturas([...asignaturas, creada]);
      setNuevaAsignatura({ descripcion: '', creditos: 3 });
      setShowModal(false);
      setToastMessage('Asignatura creada exitosamente');
      setToastColor('success');
      setShowToast(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear asignatura';
      setToastMessage(message);
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleEliminarAsignatura = async (id: string) => {
    if (!user) return;
    if (!window.confirm('¿Eliminar asignatura?')) return;

    try {
      await eliminarAsignatura(id);
      setAsignaturas(asignaturas.filter((a) => a.id !== id));
      setToastMessage('Asignatura eliminada');
      setToastColor('success');
      setShowToast(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar asignatura';
      setToastMessage(message);
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleVerDetalles = (id: string) => {
    history.push(`/asignaturas/${id}`);
  };

  const handleShake = () => {
    if (showModal) {
      setNuevaAsignatura({ descripcion: '', creditos: 3 });
      setToastMessage('Campos limpiados por agitación');
      setToastColor('success');
      setShowToast(true);
    }
  };

  useShakeDetection({
    enabled: showModal,
    onShake: handleShake,
    threshold: 15,
    debounceDelay: 500,
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/home')} aria-label="Home">
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Asignaturas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="app-main-narrow app-space-y-3">
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

          {!loading && asignaturas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <IonText color="medium">
                <p>Aún no hay asignaturas. Toca + para agregar una.</p>
              </IonText>
            </div>
          )}

          {!loading && asignaturas.map((asignatura) => (
            <IonCard key={asignatura.id} className="app-card">
              <IonCardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                      {asignatura.descripcion}
                    </p>
                    <p className="app-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                      {asignatura.creditos} créditos · Promedio {asignatura.promedio?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <IonButton fill="clear" size="small" onClick={() => handleVerDetalles(asignatura.id)} aria-label="Ver detalles">
                      <IonIcon icon={eyeOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton fill="clear" size="small" color="danger" onClick={() => handleEliminarAsignatura(asignatura.id)} aria-label="Eliminar">
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonFab vertical="bottom" horizontal="end" onClick={() => setShowModal(true)}>
          <IonFabButton>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nueva asignatura</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '1.5rem' }} className="app-space-y-4">
              <IonItem>
                <IonLabel position="floating">Descripción</IonLabel>
                <IonInput
                  value={nuevaAsignatura.descripcion}
                  onIonInput={(e) => setNuevaAsignatura({ ...nuevaAsignatura, descripcion: e.detail.value ?? '' })}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Créditos (1-12)</IonLabel>
                <IonInput
                  type="number"
                  min={1}
                  max={12}
                  value={nuevaAsignatura.creditos.toString()}
                  onIonInput={(e) => setNuevaAsignatura({ ...nuevaAsignatura, creditos: parseInt(e.detail.value ?? '3', 10) || 3 })}
                />
              </IonItem>

              <IonButton expand="block" onClick={handleCrearAsignatura}>
                Registrar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Asignaturas;
