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
import { sincronizarResumenAcademico } from '../services/academicSummaryService';
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
      if (user) {
        await sincronizarResumenAcademico(user.uid);
      }
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
      <IonHeader className="ion-no-border">
        <header className="app-header" style={{ padding: '0.75rem 1.25rem' }}>
          <button
            onClick={() => history.replace(`/asignaturas/${idAsignatura}`)}
            aria-label="Regresar"
            className="app-button-base app-button-ghost app-button-icon app-flex app-items-center app-justify-center"
            style={{ width: '2.5rem', height: '2.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <IonIcon icon={arrowBackOutline} style={{ fontSize: '1.25rem' }} />
          </button>
          <h1 className="app-header-title" style={{ margin: 0, paddingLeft: '0.25rem' }}>Editar Evaluación</h1>
        </header>
      </IonHeader>

      <IonContent fullscreen className="app-bg-background">
        <div className="app-main-narrow app-space-y-4">
          <div className="app-card app-p-5 app-space-y-4">
            <div className="app-field">
              <label htmlFor="nota-descripcion" className="app-field-label">Descripción</label>
              <IonInput
                id="nota-descripcion"
                className="app-input-base"
                value={descripcion}
                onIonInput={(e) => setDescripcion(e.detail.value ?? '')}
              />
            </div>

            <div className="app-grid-2 app-gap-3">
              <div className="app-field">
                <label htmlFor="nota-porcentaje" className="app-field-label">Porcentaje</label>
                <IonInput
                  id="nota-porcentaje"
                  className="app-input-base"
                  type="number"
                  value={porcentaje.toString()}
                  onIonInput={(e) => setPorcentaje(parseInt(e.detail.value ?? '0', 10) || 0)}
                />
              </div>
              <div className="app-field">
                <label htmlFor="nota-calificacion" className="app-field-label">Nota</label>
                <IonInput
                  id="nota-calificacion"
                  className="app-input-base"
                  type="number"
                  step="0.1"
                  value={calificacion.toString()}
                  onIonInput={(e) => setCalificacion(parseFloat(e.detail.value ?? '0') || 0)}
                />
              </div>
            </div>

            <div className="app-stat-box" style={{ textAlign: 'center', borderRadius: 'var(--radius)', background: 'var(--muted)', border: '1px solid var(--border)', padding: '0.75rem' }}>
              <p className="app-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Promedio de esta evaluación</p>
              <p className="app-title-md" style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '1.125rem' }}>
                {((calificacion * porcentaje) / 100).toFixed(2)}
              </p>
            </div>

            <div className="app-flex app-flex-col app-gap-2" style={{ paddingTop: '0.5rem' }}>
              <IonButton 
                expand="block" 
                onClick={handleSave} 
                className="app-button-base app-button-primary"
                disabled={saving}
                style={{ margin: 0 }}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </IonButton>
              <button 
                onClick={() => history.replace(`/asignaturas/${idAsignatura}`)} 
                disabled={saving}
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
