import { useEffect, useState, useRef } from 'react';
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
  useIonViewWillEnter,
} from '@ionic/react';
import { addOutline, homeOutline, trashOutline, eyeOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { crearAsignatura, eliminarAsignatura } from '../services/asignaturaService';
import { sincronizarResumenAcademico } from '../services/academicSummaryService';
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
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFirstEnter = useRef(true);

  useIonViewWillEnter(() => {
    if (isFirstEnter.current) {
      isFirstEnter.current = false;
      return;
    }
    setRefreshTrigger((prev) => prev + 1);
  });

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
        const data = await sincronizarResumenAcademico(user.uid);
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
  }, [user, refreshTrigger]);

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
      const sincronizadas = await sincronizarResumenAcademico(user.uid);
      setAsignaturas(sincronizadas.length ? sincronizadas : [...asignaturas, creada]);
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
      const sincronizadas = await sincronizarResumenAcademico(user.uid);
      setAsignaturas(sincronizadas);
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
      <IonHeader className="ion-no-border">
        <header className="app-header" style={{ padding: '0.75rem 1.25rem' }}>
          <button
            onClick={() => history.replace('/home')}
            aria-label="Home"
            className="app-button-base app-button-ghost app-button-icon app-flex app-items-center app-justify-center"
            style={{ width: '2.5rem', height: '2.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <IonIcon icon={homeOutline} style={{ fontSize: '1.25rem' }} />
          </button>
          <h1 className="app-header-title" style={{ margin: 0, paddingLeft: '0.25rem' }}>Asignaturas</h1>
        </header>
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
            <div key={asignatura.id} className="app-card app-p-4">
              <div className="app-flex app-justify-between app-items-center app-gap-3">
                <div className="app-min-w-0">
                  <p className="app-font-medium app-truncate" style={{ margin: 0 }}>
                    {asignatura.descripcion}
                  </p>
                  <p className="app-text-xs app-text-muted-foreground" style={{ margin: '0.25rem 0 0 0' }}>
                    {asignatura.creditos} créditos · Promedio {asignatura.promedio?.toFixed(2) || '0.00'} · {asignatura.aprueba ? 'Aprueba' : 'No aprueba'}
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
            </div>
          ))}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton className="app-fab-button" onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="app-modal-shell">
            <div className="app-modal-header app-flex app-items-center app-justify-center" style={{ position: 'relative', borderBottom: 'none', padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
              <h2 className="app-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Nueva asignatura</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '1.25rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>
            <div className="app-modal-content app-space-y-4" style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
              <div className="app-field">
                <label htmlFor="descripcion" className="app-field-label">Nombre</label>
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

              <div className="app-flex app-flex-col app-gap-2" style={{ paddingTop: '0.5rem' }}>
                <IonButton
                  expand="block"
                  onClick={handleCrearAsignatura}
                  className="app-button-base app-button-primary"
                  style={{ margin: 0 }}
                >
                  Registrar
                </IonButton>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="app-button-base app-button-outline app-w-full app-flex app-items-center app-justify-center"
                  style={{
                    height: '3rem',
                    fontSize: '0.95rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.625rem',
                    background: '#ffffff',
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
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
