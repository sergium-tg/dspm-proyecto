export interface StatGridProps {
  promedio: string;
  metaBecas: string;
}

const StatGrid: React.FC<StatGridProps> = ({ promedio, metaBecas }) => (
  <div className="app-grid-2 app-pt-2">
    <div className="app-rounded-md app-border app-p-3">
      <p className="app-text-xs app-text-muted-foreground">
        Promedio
      </p>
      <p className="app-text-lg app-font-semibold">
        {promedio}
      </p>
    </div>
    <div className="app-rounded-md app-border app-p-3">
      <p className="app-text-xs app-text-muted-foreground">
        Meta becas
      </p>
      <p className="app-text-lg app-font-semibold">
        {metaBecas}
      </p>
    </div>
  </div>
);

export default StatGrid;
