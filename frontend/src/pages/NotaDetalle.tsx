import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import { arrowBackOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { actualizarNota, obtenerNotas } from '../services/notaService';
import type { Nota } from '../types/entities';

const NotaDetalle: React.FC = () => {
  const { idAsignatura, idNota } = useParams<{ idAsignatura: string; idNota: string }>();
  const { user } = useAuth();
  const history = useHistory();
  const [nota, setNota] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [descripcion, setDescripcion] = useState('');
  const [porcentaje, setPorcentaje] = useState(0);
  const [calificacion, setCalificacion] = useState(0);

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loadNota = async () => {
      if (!user || !idAsignatura || !idNota) return;
      setLoading(true);
      try {
        const allNotas = await obtenerNotas(idAsignatura);
        const found = allNotas.find(n => n.id === idNota);
        if (found) {
          setNota(found);
          setDescripcion(found.descripcion);
          setPorcentaje(found.porcentaje);
          setCalificacion(found.calificacion);
        } else {
          setError('Nota no encontrada');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la nota');
      } finally {
        setLoading(false);
      }
    };
    loadNota();
  }, [idAsignatura, idNota, user]);

  const handleSave = async () => {
    if (!idAsignatura || !idNota) return;
    setSaving(true);
    try {
      await actualizarNota(idAsignatura, idNota, {
        descripcion: descripcion.trim(),
        porcentaje: Number(porcentaje),
        calificacion: Number(calificacion),
      });
      setToastMessage('Nota actualizada exitosamente');
      setShowToast(true);
      setTimeout(() => {
        history.replace(`/asignaturas/${idAsignatura}`);
      }, 1000);
    } catch (err: any) {
      setToastMessage(err.message || 'Error al guardar');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

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

  if (error || !nota) {
    return (
      <IonPage>
        <IonContent>
          <div className="app-page-centered">
            <IonText color="danger">
              <p>{error || 'Nota no encontrada'}</p>
            </IonText>
            <IonButton fill="clear" onClick={() => history.replace(`/asignaturas/${idAsignatura}`)}>
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
            <IonButton fill="clear" onClick={() => history.replace(`/asignaturas/${idAsignatura}`)}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Editar Evaluación</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="app-main-narrow app-space-y-4">
          <div className="app-card app-space-y-4" style={{ padding: '1.25rem' }}>
            <IonItem>
              <IonLabel position="floating">Descripción</IonLabel>
              <IonInput
                value={descripcion}
                onIonInput={(e) => setDescripcion(e.detail.value ?? '')}
              />
            </IonItem>

            <div className="app-grid-2">
              <IonItem>
                <IonLabel position="floating">Porcentaje</IonLabel>
                <IonInput
                  type="number"
                  value={porcentaje.toString()}
                  onIonInput={(e) => setPorcentaje(parseInt(e.detail.value ?? '0', 10) || 0)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Calificación</IonLabel>
                <IonInput
                  type="number"
                  step="0.1"
                  value={calificacion.toString()}
                  onIonInput={(e) => setCalificacion(parseFloat(e.detail.value ?? '0') || 0)}
                />
              </IonItem>
            </div>

            <div className="app-stat-box" style={{ textAlign: 'center' }}>
              <p className="app-muted">Promedio de esta evaluación</p>
              <p className="app-title-md">
                {((calificacion * porcentaje) / 100).toFixed(2)}
              </p>
            </div>

            <div className="app-grid-2" style={{ paddingTop: '0.5rem' }}>
              <IonButton expand="block" fill="outline" onClick={() => history.replace(`/asignaturas/${idAsignatura}`)} disabled={saving}>
                Cancelar
              </IonButton>
              <IonButton expand="block" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </IonButton>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={1000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default NotaDetalle;
