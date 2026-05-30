import { IonCard, IonCardContent } from '@ionic/react';
import type { Estudiante } from '../../types/entities';
import StatGrid from './StatGrid';

export interface StudentCardProps {
  estudiante: Estudiante;
}

const StudentCard: React.FC<StudentCardProps> = ({ estudiante }) => {
  const nombreCompleto = [estudiante.nombres || 'Sin nombre', estudiante.apellidos]
    .filter(Boolean)
    .join(' ');

  return (
    <IonCard className="app-card" style={{ maxWidth: '100%' }}>
      <IonCardContent className="app-space-y-4">
        <div>
          <p className="app-label-upper">Estudiante</p>
          <h2 className="app-title-lg" style={{ marginTop: '0.25rem' }}>
            {nombreCompleto}
          </h2>
          <p className="app-muted" style={{ margin: '0.25rem 0 0' }}>
            Código: {estudiante.codigo ?? '-'}
          </p>
        </div>

        <StatGrid
          promedio={(estudiante.promedio_semestral ?? 0).toFixed(2)}
          metaBecas={(estudiante.beneficios_promedio ?? 0).toFixed(2)}
        />

        <div
          className={
            estudiante.beneficios_cumple
              ? 'app-benefit-banner app-benefit-banner--ok'
              : 'app-benefit-banner app-benefit-banner--muted'
          }
        >
          Beneficios:{' '}
          <span style={{ fontWeight: 600 }}>
            {estudiante.beneficios_cumple ? 'Sí cumple' : 'No cumple'}
          </span>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default StudentCard;
