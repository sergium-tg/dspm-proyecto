import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface Props {
  initial?: { descripcion: string; porcentaje: number; nota: number };
  onSubmit: (descripcion: string, porcentaje: number, nota: number) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function EvaluacionForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [porcentaje, setPorcentaje] = useState<number>(initial?.porcentaje ?? 0);
  const [nota, setNota] = useState<number>(initial?.nota ?? 0);
  const [simulado, setSimulado] = useState<number | null>(null);

  const aprueba = useMemo(() => (simulado ?? 0) > 3.0, [simulado]);

  const simular = () => {
    // Promedio reactivo: (nota * porcentaje) / 100
    const prom = (nota * porcentaje) / 100;
    setSimulado(Math.round(prom * 100) / 100);
  };

  const submit = () => {
    if (!descripcion.trim()) return;
    onSubmit(descripcion.trim(), Number(porcentaje), Number(nota));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Porcentaje</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={porcentaje}
            onChange={(e) => setPorcentaje(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nota</Label>
          <Input
            type="number"
            step="0.1"
            value={nota}
            onChange={(e) => setNota(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Promedio</Label>
          <Input disabled value={simulado === null ? "—" : simulado.toFixed(2)} />
        </div>
        <div className="space-y-1.5">
          <Label>Aprueba</Label>
          <Input disabled value={simulado === null ? "—" : aprueba ? "Sí" : "No"} />
        </div>
      </div>

      <Button type="button" variant="secondary" className="w-full" onClick={simular}>
        Simular promedio
      </Button>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={submit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );
}