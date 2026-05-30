import { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
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
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  useIonViewWillEnter,
} from '@ionic/react';
import { arrowBackOutline, pencilOutline, trashOutline, addOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { obtenerAsignatura, actualizarAsignatura } from '../services/asignaturaService';
import { obtenerNotas, agregarNota, eliminarNota } from '../services/notaService';
import { sincronizarResumenAcademico } from '../services/academicSummaryService';
import type { Asignatura, Nota } from '../types/entities';

const AsignaturaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const history = useHistory();
  const [asignatura, setAsignatura] = useState<Asignatura | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal para editar asignatura
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAsignatura, setEditAsignatura] = useState({ descripcion: '', creditos: 3 });

  // Modal para agregar nota
  const [showAddNotaModal, setShowAddNotaModal] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({ descripcion: '', porcentaje: 0, calificacion: 0 });
  const [simulado, setSimulado] = useState<number | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const [asigData, notasData] = await Promise.all([
        obtenerAsignatura(id),
        obtenerNotas(id)
      ]);
      setAsignatura(asigData);
      setNotas(notasData);
      setEditAsignatura({ descripcion: asigData.descripcion, creditos: asigData.creditos });
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const isFirstEnter = useRef(true);

  useIonViewWillEnter(() => {
    if (isFirstEnter.current) {
      isFirstEnter.current = false;
      return;
    }
    loadData();
  });

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleUpdateAsignatura = async () => {
    if (!id) return;
    try {
      const updated = await actualizarAsignatura(id, {
        descripcion: editAsignatura.descripcion.trim(),
        creditos: Math.min(12, Math.max(1, Math.floor(editAsignatura.creditos || 3))),
      });
      const asignaturasActualizadas = user ? await sincronizarResumenAcademico(user.uid) : [];
      const sincronizada = asignaturasActualizadas.find((item) => item.id === id);
      setAsignatura(sincronizada ?? { ...asignatura!, ...updated });
      setShowEditModal(false);
      setToastMessage('Asignatura actualizada');
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.message || 'Error al actualizar');
      setShowToast(true);
    }
  };

  const handleAddNota = async () => {
    if (!id) return;
    if (!nuevaNota.descripcion.trim()) {
      setToastMessage('La descripción es obligatoria');
      setShowToast(true);
      return;
    }
    try {
      const creada = await agregarNota(id, {
        descripcion: nuevaNota.descripcion.trim(),
        porcentaje: Number(nuevaNota.porcentaje),
        calificacion: Number(nuevaNota.calificacion),
      });      setNotas([...notas, creada]);
      setShowAddNotaModal(false);
      setNuevaNota({ descripcion: '', porcentaje: 0, calificacion: 0 });
      setSimulado(null);
      setToastMessage('Nota agregada');
      setShowToast(true);
      const asignaturasActualizadas = user ? await sincronizarResumenAcademico(user.uid) : [];
      const asigData = asignaturasActualizadas.find((item) => item.id === id) ?? await obtenerAsignatura(id);
      setAsignatura(asigData);
    } catch (err: any) {
      setToastMessage(err.message || 'Error al agregar nota');
      setShowToast(true);
    }
  };

  const handleDeleteNota = async (idNota: string) => {
    if (!id || !window.confirm('¿Eliminar nota?')) return;
    try {
      await eliminarNota(id, idNota);
      setNotas(notas.filter(n => n.id !== idNota));
      setToastMessage('Nota eliminada');
      setShowToast(true);
      const asignaturasActualizadas = user ? await sincronizarResumenAcademico(user.uid) : [];
      const asigData = asignaturasActualizadas.find((item) => item.id === id) ?? await obtenerAsignatura(id);
      setAsignatura(asigData);
    } catch (err: any) {
      setToastMessage(err.message || 'Error al eliminar nota');
      setShowToast(true);
    }
  };

  const handleShake = () => {
    if (showAddNotaModal) {
      setNuevaNota({ descripcion: '', porcentaje: 0, calificacion: 0 });
      setSimulado(null);
      setToastMessage('Campos limpiados por agitación');
      setShowToast(true);
    }
  };

  useShakeDetection({
    enabled: showAddNotaModal,
    onShake: handleShake,
    threshold: 15,
    debounceDelay: 500,
  });

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="app-page-centered">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !asignatura) {
    return (
      <IonPage>
        <IonContent>
          <div className="app-page-centered">
            <IonText color="danger">
              <p>{error || 'Asignatura no encontrada'}</p>
            </IonText>
            <IonButton fill="clear" onClick={() => history.replace('/asignaturas')}>
              Volver
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <header className="app-header" style={{ padding: '0.75rem 1.25rem' }}>
          <button
            onClick={() => history.replace('/asignaturas')}
            aria-label="Regresar"
            className="app-button-base app-button-ghost app-button-icon app-flex app-items-center app-justify-center"
            style={{ width: '2.5rem', height: '2.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '1.25rem' }} />
          </button>
          <h1 className="app-header-title" style={{ margin: 0, paddingLeft: '0.25rem' }}>{asignatura.descripcion}</h1>
        </header>
      </IonHeader>

      <IonContent fullscreen className="app-bg-background">
        <div className="app-px-5 app-py-6 app-max-w-md app-mx-auto app-space-y-6">
          
          <div className="app-card app-p-5 app-space-y-3">
            <div className="app-flex app-justify-between app-items-start app-gap-3">
              <div>
                <p className="app-text-xs app-uppercase app-tracking-wide app-text-muted-foreground" style={{ margin: 0 }}>Asignatura</p>
                <h2 className="app-text-xl app-font-semibold" style={{ margin: '0.125rem 0 0 0' }}>{asignatura.descripcion}</h2>
              </div>
              <button 
                onClick={() => setShowEditModal(true)} 
                className="app-button-base app-button-outline app-flex app-items-center app-gap-1.5"
                style={{ 
                  height: '2.25rem', 
                  fontSize: '0.875rem', 
                  padding: '0 0.75rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)', 
                  background: 'transparent',
                  color: 'var(--foreground)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <IonIcon icon={pencilOutline} style={{ fontSize: '0.95rem' }} />
                Edición
              </button>
            </div>

            <div className="app-grid-3 app-gap-3" style={{ paddingTop: '0.25rem' }}>
              <div className="app-stat-box-sm">
                <p className="app-stat-box-sm-label" style={{ margin: 0, fontSize: '0.625rem', letterSpacing: '0.05em' }}>Créditos</p>
                <p className="app-stat-box-sm-value" style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: 600 }}>{asignatura.creditos}</p>
              </div>
              <div className="app-stat-box-sm">
                <p className="app-stat-box-sm-label" style={{ margin: 0, fontSize: '0.625rem', letterSpacing: '0.05em' }}>Promedio</p>
                <p className="app-stat-box-sm-value" style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: 600 }}>{asignatura.promedio.toFixed(2)}</p>
              </div>
              <div className="app-stat-box-sm">
                <p className="app-stat-box-sm-label" style={{ margin: 0, fontSize: '0.625rem', letterSpacing: '0.05em' }}>Aprueba</p>
                <p className="app-stat-box-sm-value" style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', fontWeight: 600 }}>{asignatura.aprueba ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="app-space-y-2">
            <h3 className="app-section-title">Evaluaciones</h3>
            {notas.length === 0 && (
              <p className="app-text-sm app-text-muted-foreground app-text-center app-py-8">
                Sin evaluaciones aún.
              </p>
            )}
            {notas.map((nota) => (
              <div key={nota.id} className="app-card app-p-4">
                <div className="app-flex app-justify-between app-items-center app-gap-3">
                  <div className="app-min-w-0">
                    <p className="app-font-medium app-truncate" style={{ margin: 0 }}>
                      {nota.descripcion}
                    </p>
                    <p className="app-text-xs app-text-muted-foreground" style={{ margin: '0.25rem 0 0 0' }}>
                      {nota.porcentaje}% · Nota {nota.calificacion}
                    </p>
                  </div>
                  <div className="app-flex app-gap-1 app-shrink-0">
                    <IonButton fill="clear" size="small" onClick={() => history.push(`/asignaturas/${id}/notas/${nota.id}`)} aria-label="Editar" className="app-button-base app-button-ghost app-button-icon">
                      <IonIcon icon={pencilOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteNota(nota.id)} aria-label="Eliminar" className="app-button-base app-button-ghost app-button-icon">
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton className="app-fab-button" onClick={() => setShowAddNotaModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal Editar Asignatura */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <div className="app-modal-shell">
            <div className="app-modal-header app-flex app-items-center app-justify-center" style={{ position: 'relative', borderBottom: 'none', padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
              <h2 className="app-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Editar asignatura</h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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
                <label htmlFor="edit-descripcion" className="app-field-label">Nombre</label>
                <IonInput
                  id="edit-descripcion"
                  className="app-input-base"
                  value={editAsignatura.descripcion}
                  onIonInput={(e) => setEditAsignatura({ ...editAsignatura, descripcion: e.detail.value ?? '' })}
                />
              </div>
              <div className="app-field">
                <label htmlFor="edit-creditos" className="app-field-label">Créditos</label>
                <IonInput
                  id="edit-creditos"
                  className="app-input-base"
                  type="number"
                  min={1}
                  max={12}
                  value={editAsignatura.creditos.toString()}
                  onIonInput={(e) => setEditAsignatura({ ...editAsignatura, creditos: parseInt(e.detail.value ?? '3', 10) || 3 })}
                />
              </div>
              <div className="app-flex app-flex-col app-gap-2" style={{ paddingTop: '0.5rem' }}>
                <IonButton 
                  expand="block" 
                  onClick={handleUpdateAsignatura} 
                  className="app-button-base app-button-primary"
                  style={{ margin: 0 }}
                >
                  Guardar cambios
                </IonButton>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)} 
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

        {/* Modal Nueva Nota */}
        <IonModal isOpen={showAddNotaModal} onDidDismiss={() => { setShowAddNotaModal(false); setSimulado(null); }}>
          <div className="app-modal-shell">
            <div className="app-modal-header app-flex app-items-center app-justify-center" style={{ position: 'relative', borderBottom: 'none', padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
              <h2 className="app-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Nueva evaluación</h2>
              <button
                type="button"
                onClick={() => { setShowAddNotaModal(false); setSimulado(null); }}
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
                <label htmlFor="nota-descripcion" className="app-field-label">Descripción</label>
                <IonInput
                  id="nota-descripcion"
                  className="app-input-base"
                  value={nuevaNota.descripcion}
                  onIonInput={(e) => setNuevaNota({ ...nuevaNota, descripcion: e.detail.value ?? '' })}
                />
              </div>
              <div className="app-grid-2 app-gap-3">
                <div className="app-field">
                  <label htmlFor="nota-porcentaje" className="app-field-label">Porcentaje</label>
                  <IonInput
                    id="nota-porcentaje"
                    className="app-input-base"
                    type="number"
                    value={nuevaNota.porcentaje.toString()}
                    onIonInput={(e) => setNuevaNota({ ...nuevaNota, porcentaje: parseInt(e.detail.value ?? '0', 10) || 0 })}
                  />
                </div>
                <div className="app-field">
                  <label htmlFor="nota-calificacion" className="app-field-label">Nota</label>
                  <IonInput
                    id="nota-calificacion"
                    className="app-input-base"
                    type="number"
                    step="0.1"
                    value={nuevaNota.calificacion.toString()}
                    onIonInput={(e) => setNuevaNota({ ...nuevaNota, calificacion: parseFloat(e.detail.value ?? '0') || 0 })}
                  />
                </div>
              </div>

              <div className="app-grid-2 app-gap-3">
                <div className="app-field">
                  <label className="app-field-label">Promedio</label>
                  <IonInput
                    className="app-input-base"
                    disabled
                    value={simulado === null ? '—' : simulado.toFixed(2)}
                  />
                </div>
                <div className="app-field">
                  <label className="app-field-label">Aprueba</label>
                  <IonInput
                    className="app-input-base"
                    disabled
                    value={simulado === null ? '—' : (simulado > 3.0 ? 'Sí' : 'No')}
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const prom = (nuevaNota.calificacion * nuevaNota.porcentaje) / 100;
                  setSimulado(Math.round(prom * 100) / 100);
                }}
                className="app-button-base app-w-full app-flex app-items-center app-justify-center"
                style={{ 
                  height: '3rem', 
                  fontSize: '0.95rem', 
                  borderRadius: '0.625rem', 
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxSizing: 'border-box'
                }}
              >
                Simular promedio
              </button>

              <div className="app-flex app-flex-col app-gap-2" style={{ paddingTop: '0.25rem' }}>
                <IonButton 
                  expand="block" 
                  onClick={handleAddNota} 
                  className="app-button-base app-button-primary"
                  style={{ margin: 0 }}
                >
                  Registrar
                </IonButton>
                <button
                  type="button"
                  onClick={() => { setShowAddNotaModal(false); setSimulado(null); }} 
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
        />
      </IonContent>
    </IonPage>
  );
};

export default AsignaturaDetalle;
