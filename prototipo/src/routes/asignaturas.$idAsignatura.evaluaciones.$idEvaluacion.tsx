import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EvaluacionForm } from "@/components/evaluacion-form";
import { getEvaluaciones, saveEvaluaciones } from "@/lib/store";
import type { Evaluacion } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/asignaturas/$idAsignatura/evaluaciones/$idEvaluacion")({
  component: () => (
    <Protected>
      <EditarEvaluacion />
    </Protected>
  ),
});

function EditarEvaluacion() {
  const { idAsignatura, idEvaluacion } = Route.useParams();
  const idAsig = Number(idAsignatura);
  const idEv = Number(idEvaluacion);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ev, setEv] = useState<Evaluacion | null>(null);

  useEffect(() => {
    if (!user) return;
    const found = getEvaluaciones(user.uid).find((e) => e.id === idEv) ?? null;
    setEv(found);
  }, [user, idEv]);

  const back = () =>
    navigate({ to: "/asignaturas/$idAsignatura", params: { idAsignatura: String(idAsig) } });

  if (!user) return null;
  if (!ev) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Evaluación no encontrada.</div>
    );
  }

  const save = (descripcion: string, porcentaje: number, nota: number) => {
    const all = getEvaluaciones(user.uid).map((e) =>
      e.id === idEv ? { ...e, descripcion, porcentaje, nota } : e,
    );
    saveEvaluaciones(user.uid, all);
    toast.success("Evaluación actualizada");
    back();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-4 border-b">
        <Button variant="ghost" size="icon" asChild aria-label="Regresar">
          <Link
            to="/asignaturas/$idAsignatura"
            params={{ idAsignatura: String(idAsig) }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Editar evaluación</h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto">
        <Card className="p-5">
          <EvaluacionForm
            initial={{ descripcion: ev.descripcion, porcentaje: ev.porcentaje, nota: ev.nota }}
            onSubmit={save}
            onCancel={back}
            submitLabel="Guardar cambios"
          />
        </Card>
      </main>
    </div>
  );
}