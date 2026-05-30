export interface StatGridProps {
  promedio: string;
  metaBecas: string;
}

const StatGrid: React.FC<StatGridProps> = ({ promedio, metaBecas }) => (
  <div className="app-grid-2" style={{ paddingTop: '0.5rem' }}>
    <div className="app-stat-box">
      <p className="app-muted" style={{ margin: '0 0 0.25rem' }}>
        Promedio
      </p>
      <p className="app-title-md" style={{ fontSize: '1.125rem' }}>
        {promedio}
      </p>
    </div>
    <div className="app-stat-box">
      <p className="app-muted" style={{ margin: '0 0 0.25rem' }}>
        Meta becas
      </p>
      <p className="app-title-md" style={{ fontSize: '1.125rem' }}>
        {metaBecas}
      </p>
    </div>
  </div>
);

export default StatGrid;
