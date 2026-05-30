import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Plus, Search, Trash2 } from "lucide-react";
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
  nextAsignaturaId,
  recomputeAsignaturas,
  getEvaluaciones,
  saveEvaluaciones,
} from "@/lib/store";
import type { Asignatura } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/asignaturas/")({
  component: () => (
    <Protected>
      <AsignaturasPage />
    </Protected>
  ),
});

function AsignaturasPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Asignatura[]>([]);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [creditos, setCreditos] = useState(3);

  const refresh = () => {
    if (!user) return;
    recomputeAsignaturas(user.uid);
    setList(getAsignaturas(user.uid));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const add = () => {
    if (!user) return;
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const c = Math.min(12, Math.max(1, Math.floor(creditos || 3)));
    const nueva: Asignatura = {
      id: nextAsignaturaId(user.uid),
      nombre: nombre.trim(),
      creditos: c,
      promedio: 0,
      aprueba: false,
      usuario_id: 0,
    };
    saveAsignaturas(user.uid, [...getAsignaturas(user.uid), nueva]);
    setNombre("");
    setCreditos(3);
    setOpen(false);
    refresh();
  };

  const remove = (id: number) => {
    if (!user) return;
    if (!confirm("¿Eliminar asignatura y sus evaluaciones?")) return;
    saveAsignaturas(user.uid, getAsignaturas(user.uid).filter((a) => a.id !== id));
    saveEvaluaciones(
      user.uid,
      getEvaluaciones(user.uid).filter((e) => e.asignatura_id !== id),
    );
    refresh();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-5 py-4 border-b">
        <Button variant="ghost" size="icon" asChild aria-label="Home">
          <Link to="/home">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Asignaturas</h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Aún no hay asignaturas. Toca + para agregar una.
          </p>
        )}
        {list.map((a) => (
          <Card key={a.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{a.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {a.creditos} créditos · Promedio {a.promedio.toFixed(2)} ·{" "}
                {a.aprueba ? "Aprueba" : "No aprueba"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Ver detalles"
                onClick={() =>
                  navigate({ to: "/asignaturas/$idAsignatura", params: { idAsignatura: String(a.id) } })
                }
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => remove(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </main>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Agregar asignatura"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva asignatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Créditos (1-12)</Label>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={add}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}