import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAsignaturas,
  saveAsignaturas,
  getEvaluaciones,
  saveEvaluaciones,
  nextEvaluacionId,
  recomputeAsignaturas,
} from "@/lib/store";
import type { Asignatura, Evaluacion } from "@/lib/types";
import { toast } from "sonner";
import { EvaluacionForm } from "@/components/evaluacion-form";

export const Route = createFileRoute("/asignaturas/$idAsignatura/")({
  component: () => (
    <Protected>
      <DetallePage />
    </Protected>
  ),
});

function DetallePage() {
  const { idAsignatura } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const idNum = Number(idAsignatura);

  const [asig, setAsig] = useState<Asignatura | null>(null);
  const [evals, setEvals] = useState<Evaluacion[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [creditos, setCreditos] = useState(3);
  const [addOpen, setAddOpen] = useState(false);

  const refresh = () => {
    if (!user) return;
    recomputeAsignaturas(user.uid);
    const a = getAsignaturas(user.uid).find((x) => x.id === idNum) ?? null;
    setAsig(a);
    if (a) {
      setNombre(a.nombre);
      setCreditos(a.creditos);
    }
    setEvals(getEvaluaciones(user.uid).filter((e) => e.asignatura_id === idNum));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, idNum]);

  if (!asig) {
    return (
      <Protected>
        <div className="p-6 text-sm text-muted-foreground">Asignatura no encontrada.</div>
      </Protected>
    );
  }

  const saveAsig = () => {
    if (!user) return;
    const c = Math.min(12, Math.max(1, Math.floor(creditos || 3)));
    const all = getAsignaturas(user.uid).map((a) =>
      a.id === asig.id ? { ...a, nombre: nombre.trim() || a.nombre, creditos: c } : a,
    );
    saveAsignaturas(user.uid, all);
    setEditOpen(false);
    refresh();
    toast.success("Asignatura actualizada");
  };

  const addEval = (descripcion: string, porcentaje: number, nota: number) => {
    if (!user) return;
    const nuevo: Evaluacion = {
      id: nextEvaluacionId(user.uid),
      descripcion,
      porcentaje,
      nota,
      asignatura_id: idNum,
    };
    saveEvaluaciones(user.uid, [...getEvaluaciones(user.uid), nuevo]);
    setAddOpen(false);
    refresh();
  };

  const removeEval = (id: number) => {
    if (!user) return;
    if (!confirm("¿Eliminar evaluación?")) return;
    saveEvaluaciones(user.uid, getEvaluaciones(user.uid).filter((e) => e.id !== id));
    refresh();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-5 py-4 border-b">
        <Button variant="ghost" size="icon" asChild aria-label="Regresar">
          <Link to="/asignaturas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold truncate">{asig.nombre}</h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Asignatura</p>
              <h2 className="text-xl font-semibold">{asig.nombre}</h2>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edición
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <Stat label="Créditos" value={String(asig.creditos)} />
            <Stat label="Promedio" value={asig.promedio.toFixed(2)} />
            <Stat label="Aprueba" value={asig.aprueba ? "Sí" : "No"} />
          </div>
        </Card>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Evaluaciones</h3>
          {evals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin evaluaciones aún.
            </p>
          )}
          {evals.map((ev) => (
            <Card key={ev.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{ev.descripcion}</p>
                <p className="text-xs text-muted-foreground">
                  {ev.porcentaje}% · Nota {ev.nota}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar"
                  onClick={() =>
                    navigate({
                      to: "/asignaturas/$idAsignatura/evaluaciones/$idEvaluacion",
                      params: {
                        idAsignatura: String(idNum),
                        idEvaluacion: String(ev.id),
                      },
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Eliminar"
                  onClick={() => removeEval(ev.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setAddOpen(true)}
        aria-label="Agregar evaluación"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Edit asignatura dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar asignatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Créditos</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={creditos}
                onChange={(e) => setCreditos(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveAsig}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add evaluacion dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva evaluación</DialogTitle>
          </DialogHeader>
          <EvaluacionForm
            onCancel={() => setAddOpen(false)}
            onSubmit={addEval}
            submitLabel="Registrar"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2 text-center">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}