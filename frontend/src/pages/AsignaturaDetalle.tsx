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
      <IonHeader className="app-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/asignaturas')} className="app-button-base app-button-ghost app-button-icon">
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle className="app-header-title app-truncate">{asignatura.descripcion}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="app-bg-background">
        <div className="app-px-5 app-py-6 app-max-w-md app-mx-auto app-space-y-6">
          <IonCard className="app-card app-card-content app-space-y-4">
            <IonCardContent>
              <div className="app-flex app-justify-between app-items-start app-gap-3">
                <div>
                  <p className="app-text-xs app-uppercase app-tracking-wide app-text-muted-foreground">Asignatura</p>
                  <h2 className="app-text-xl app-font-semibold">{asignatura.descripcion}</h2>
                </div>
                <IonButton fill="outline" size="small" onClick={() => setShowEditModal(true)} className="app-button-base app-button-outline">
                  <IonIcon icon={pencilOutline} slot="start" />
                  Edición
                </IonButton>
              </div>

              <div className="app-grid-3 app-gap-3 app-pt-1">
                <div className="app-stat-box-sm">
                  <p className="app-stat-box-sm-label">Créditos</p>
                  <p className="app-stat-box-sm-value">{asignatura.creditos}</p>
                </div>
                <div className="app-stat-box-sm">
                  <p className="app-stat-box-sm-label">Promedio</p>
                  <p className="app-stat-box-sm-value">{asignatura.promedio.toFixed(2)}</p>
                </div>
                <div className="app-stat-box-sm">
                  <p className="app-stat-box-sm-label">Aprueba</p>
                  <p className="app-stat-box-sm-value">{asignatura.aprueba ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <div className="app-space-y-2">
            <h3 className="app-section-title">Evaluaciones</h3>
            {notas.length === 0 && (
              <p className="app-text-sm app-text-muted-foreground app-text-center app-py-8">
                Sin evaluaciones aún.
              </p>
            )}
            {notas.map((nota) => (
              <IonCard key={nota.id} className="app-card app-card-content-sm">
                <IonCardContent>
                  <div className="app-list-item-content">
                    <div className="app-min-w-0">
                      <p className="app-list-item-title">{nota.descripcion}</p>
                      <p className="app-list-item-subtitle">
                        {nota.porcentaje}% · Nota {nota.calificacion}
                      </p>
                    </div>
                    <div className="app-list-item-actions">
                      <IonButton fill="clear" size="small" onClick={() => history.push(`/asignaturas/${id}/notas/${nota.id}`)} aria-label="Editar" className="app-button-base app-button-ghost app-button-icon">
                        <IonIcon icon={pencilOutline} slot="icon-only" />
                      </IonButton>
                      <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteNota(nota.id)} aria-label="Eliminar" className="app-button-base app-button-ghost app-button-icon">
                        <IonIcon icon={trashOutline} slot="icon-only" />
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" onClick={() => setShowAddNotaModal(true)}>
          <IonFabButton className="app-fab-button">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal Editar Asignatura */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader className="app-modal-header">
            <IonToolbar>
              <IonTitle className="app-modal-title">Editar asignatura</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)} className="app-button-base app-button-ghost">Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="app-modal-content app-space-y-4">
              <div className="app-field">
                <label htmlFor="edit-descripcion" className="app-field-label">Descripción</label>
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
              <div className="app-modal-footer">
                <IonButton expand="block" fill="outline" onClick={() => setShowEditModal(false)} className="app-button-base app-button-outline">
                  Cancelar
                </IonButton>
                <IonButton expand="block" onClick={handleUpdateAsignatura} className="app-button-base app-button-primary">
                  Guardar cambios
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal Nueva Nota */}
        <IonModal isOpen={showAddNotaModal} onDidDismiss={() => setShowAddNotaModal(false)}>
          <IonHeader className="app-modal-header">
            <IonToolbar>
              <IonTitle className="app-modal-title">Nueva evaluación</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddNotaModal(false)} className="app-button-base app-button-ghost">Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="app-modal-content app-space-y-4">
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

              <IonButton expand="block" onClick={handleAddNota} className="app-button-base app-button-primary">
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
        />
      </IonContent>
    </IonPage>
  );
};

export default AsignaturaDetalle;
