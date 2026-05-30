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
      <IonHeader className="app-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/home')} aria-label="Home" className="app-button-base app-button-ghost app-button-icon">
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle className="app-header-title">Asignaturas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="app-bg-background">
        <div className="app-px-5 app-py-6 app-max-w-md app-mx-auto app-space-y-3">
          {loading && (
            <div className="app-text-center app-p-6">
              <IonSpinner name="crescent" />
            </div>
          )}

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          {!loading && asignaturas.length === 0 && (
            <p className="app-text-sm app-text-muted-foreground app-text-center app-py-12">
              Aún no hay asignaturas. Toca + para agregar una.
            </p>
          )}

          {!loading && asignaturas.map((asignatura) => (
            <IonCard key={asignatura.id} className="app-card app-card-content-sm">
              <IonCardContent>
                <div className="app-flex app-justify-between app-items-center app-gap-3">
                  <div className="app-min-w-0">
                    <p className="app-font-medium app-truncate">
                      {asignatura.descripcion}
                    </p>
                    <p className="app-text-xs app-text-muted-foreground">
                      {asignatura.creditos} créditos · Promedio {asignatura.promedio?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="app-flex app-gap-1 app-shrink-0">
                    <IonButton fill="clear" size="small" onClick={() => handleVerDetalles(asignatura.id)} aria-label="Ver detalles" className="app-button-base app-button-ghost app-button-icon">
                      <IonIcon icon={eyeOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton fill="clear" size="small" color="danger" onClick={() => handleEliminarAsignatura(asignatura.id)} aria-label="Eliminar" className="app-button-base app-button-ghost app-button-icon">
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" onClick={() => setShowModal(true)}>
          <IonFabButton className="app-fab-button">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader className="app-modal-header">
            <IonToolbar>
              <IonTitle className="app-modal-title">Nueva asignatura</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)} className="app-button-base app-button-ghost">Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="app-modal-content app-space-y-4">
              <div className="app-field">
                <label htmlFor="descripcion" className="app-field-label">Descripción</label>
                <IonInput
                  id="descripcion"
                  className="app-input-base"
                  value={nuevaAsignatura.descripcion}
                  onIonInput={(e) => setNuevaAsignatura({ ...nuevaAsignatura, descripcion: e.detail.value ?? '' })}
                />
              </div>

              <div className="app-field">
                <label htmlFor="creditos" className="app-field-label">Créditos (1-12)</label>
                <IonInput
                  id="creditos"
                  className="app-input-base"
                  type="number"
                  min={1}
                  max={12}
                  value={nuevaAsignatura.creditos.toString()}
                  onIonInput={(e) => setNuevaAsignatura({ ...nuevaAsignatura, creditos: parseInt(e.detail.value ?? '3', 10) || 3 })}
                />
              </div>

              <IonButton expand="block" onClick={handleCrearAsignatura} className="app-button-base app-button-primary">
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
