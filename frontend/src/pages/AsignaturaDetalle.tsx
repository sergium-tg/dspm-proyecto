import { useEffect, useState } from 'react';
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
} from '@ionic/react';
import { arrowBackOutline, pencilOutline, trashOutline, addOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { obtenerAsignatura, actualizarAsignatura } from '../services/asignaturaService';
import { obtenerNotas, agregarNota, eliminarNota } from '../services/notaService';
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
      setAsignatura({ ...asignatura!, ...updated });
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
      });
      setNotas([...notas, creada]);
      setShowAddNotaModal(false);
      setNuevaNota({ descripcion: '', porcentaje: 0, calificacion: 0 });
      setToastMessage('Nota agregada');
      setShowToast(true);
      // Recargar datos para ver el nuevo promedio de la asignatura
      const asigData = await obtenerAsignatura(id);
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
      // Recargar datos para ver el nuevo promedio
      const asigData = await obtenerAsignatura(id);
      setAsignatura(asigData);
    } catch (err: any) {
      setToastMessage(err.message || 'Error al eliminar nota');
      setShowToast(true);
    }
  };

  const handleShake = () => {
    if (showAddNotaModal) {
      setNuevaNota({ descripcion: '', porcentaje: 0, calificacion: 0 });
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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/asignaturas')}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{asignatura.descripcion}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="app-main-narrow app-space-y-4">
          <IonCard className="app-card">
            <IonCardContent className="app-space-y-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="app-label-upper">Asignatura</p>
                  <h2 className="app-title-lg">{asignatura.descripcion}</h2>
                </div>
                <IonButton fill="outline" size="small" onClick={() => setShowEditModal(true)}>
                  <IonIcon icon={pencilOutline} slot="start" />
                  Editar
                </IonButton>
              </div>

              <div className="app-grid-2">
                <div className="app-stat-box">
                  <p className="app-muted">Créditos</p>
                  <p className="app-title-md">{asignatura.creditos}</p>
                </div>
                <div className="app-stat-box">
                  <p className="app-muted">Promedio</p>
                  <p className="app-title-md">{asignatura.promedio.toFixed(2)}</p>
                </div>
              </div>

              <div className={`app-benefit-banner ${asignatura.aprueba ? 'app-benefit-banner--ok' : 'app-benefit-banner--muted'}`}>
                Estado: <span style={{ fontWeight: 600 }}>{asignatura.aprueba ? 'Aprobada' : 'Reprobada'}</span>
              </div>
            </IonCardContent>
          </IonCard>

          <div className="app-space-y-2">
            <h3 className="app-title-md" style={{ fontSize: '1rem', padding: '0 0.5rem' }}>Evaluaciones</h3>
            {notas.length === 0 && (
              <p className="app-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                Aún no hay evaluaciones registradas.
              </p>
            )}
            <IonList lines="none" style={{ background: 'transparent' }}>
              {notas.map((nota) => (
                <IonItemSliding key={nota.id}>
                  <IonItem className="app-card" style={{ marginBottom: '0.75rem', '--background': 'var(--card)' }}>
                    <IonLabel>
                      <h3 style={{ fontWeight: 600 }}>{nota.descripcion}</h3>
                      <p className="app-muted">
                        {nota.porcentaje}% · Calificación {nota.calificacion.toFixed(1)}
                      </p>
                    </IonLabel>
                    <IonButtons slot="end">
                      <IonButton fill="clear" color="medium" onClick={() => history.push(`/asignaturas/${id}/notas/${nota.id}`)}>
                        <IonIcon icon={pencilOutline} slot="icon-only" />
                      </IonButton>
                      <IonButton fill="clear" color="danger" onClick={() => handleDeleteNota(nota.id)}>
                        <IonIcon icon={trashOutline} slot="icon-only" />
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => handleDeleteNota(nota.id)}>
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowAddNotaModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal Editar Asignatura */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Asignatura</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="app-main-narrow app-space-y-4">
              <IonItem>
                <IonLabel position="floating">Descripción</IonLabel>
                <IonInput
                  value={editAsignatura.descripcion}
                  onIonInput={(e) => setEditAsignatura({ ...editAsignatura, descripcion: e.detail.value ?? '' })}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Créditos</IonLabel>
                <IonInput
                  type="number"
                  value={editAsignatura.creditos.toString()}
                  onIonInput={(e) => setEditAsignatura({ ...editAsignatura, creditos: parseInt(e.detail.value ?? '3', 10) || 3 })}
                />
              </IonItem>
              <IonButton expand="block" onClick={handleUpdateAsignatura}>
                Guardar Cambios
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal Nueva Nota */}
        <IonModal isOpen={showAddNotaModal} onDidDismiss={() => setShowAddNotaModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nueva Evaluación</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddNotaModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="app-main-narrow app-space-y-4">
              <IonItem>
                <IonLabel position="floating">Descripción</IonLabel>
                <IonInput
                  value={nuevaNota.descripcion}
                  onIonInput={(e) => setNuevaNota({ ...nuevaNota, descripcion: e.detail.value ?? '' })}
                />
              </IonItem>
              <div className="app-grid-2">
                <IonItem>
                  <IonLabel position="floating">Porcentaje</IonLabel>
                  <IonInput
                    type="number"
                    value={nuevaNota.porcentaje.toString()}
                    onIonInput={(e) => setNuevaNota({ ...nuevaNota, porcentaje: parseInt(e.detail.value ?? '0', 10) || 0 })}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Calificación</IonLabel>
                  <IonInput
                    type="number"
                    step="0.1"
                    value={nuevaNota.calificacion.toString()}
                    onIonInput={(e) => setNuevaNota({ ...nuevaNota, calificacion: parseFloat(e.detail.value ?? '0') || 0 })}
                  />
                </IonItem>
              </div>
              
              <div className="app-stat-box" style={{ textAlign: 'center' }}>
                 <p className="app-muted">Promedio Proyectado</p>
                 <p className="app-title-md">
                   {((nuevaNota.calificacion * nuevaNota.porcentaje) / 100).toFixed(2)}
                 </p>
              </div>

              <IonButton expand="block" onClick={handleAddNota}>
                Registrar Evaluación
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
        />
      </IonContent>
    </IonPage>
  );
};

export default AsignaturaDetalle;
