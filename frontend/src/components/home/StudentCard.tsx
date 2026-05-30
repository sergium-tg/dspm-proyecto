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
      <IonCardContent className="app-card-content app-space-y-4">
        <div className="app-space-y-1">
          <p className="app-text-xs app-uppercase app-tracking-wide app-text-muted-foreground">Estudiante</p>
          <h2 className="app-text-2xl app-font-semibold">
            {nombreCompleto}
          </h2>
          <p className="app-text-sm app-text-muted-foreground">
            Código: {estudiante.codigo ?? '-'}
          </p>
        </div>

        <StatGrid
          promedio={(estudiante.promedio_semestral ?? 0).toFixed(2)}
          metaBecas={(estudiante.beneficios_promedio ?? 0).toFixed(2)}
        />

        <div
          className={`app-text-sm app-rounded-md app-px-3 app-py-2 ${
            estudiante.beneficios_cumple
              ? 'app-bg-primary/10 app-text-primary'
              : 'app-bg-muted app-text-muted-foreground'
          }`}
        >
          Beneficios:{' '}
          <span className="app-font-medium">
            {estudiante.beneficios_cumple ? 'Sí cumple' : 'No cumple'}
          </span>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default StudentCard;
