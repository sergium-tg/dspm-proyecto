import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getEstudiante, saveEstudiante } from "@/lib/store";
import type { Estudiante } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  component: () => (
    <Protected>
      <PerfilPage />
    </Protected>
  ),
});

function PerfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [est, setEst] = useState<Estudiante | null>(null);

  useEffect(() => {
    if (!user) return;
    setEst(getEstudiante(user.uid, user.email ?? ""));
  }, [user]);

  if (!est) return null;

  const save = () => {
    if (!user) return;
    saveEstudiante(user.uid, est);
    toast.success("Perfil guardado");
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-5 py-4 border-b">
        <Button variant="ghost" size="icon" asChild aria-label="Home">
          <Link to="/home">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Perfil</h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto">
        <Card className="p-5 space-y-4">
          <Field label="Código">
            <Input
              type="number"
              value={est.codigo}
              onChange={(e) => setEst({ ...est, codigo: Number(e.target.value) })}
            />
          </Field>
          <Field label="Nombres">
            <Input value={est.nombres} onChange={(e) => setEst({ ...est, nombres: e.target.value })} />
          </Field>
          <Field label="Apellidos">
            <Input
              value={est.apellidos}
              onChange={(e) => setEst({ ...est, apellidos: e.target.value })}
            />
          </Field>
          <Field label="Promedio meta para beneficios">
            <Input
              type="number"
              step="0.01"
              value={est.beneficios_promedio}
              onChange={(e) =>
                setEst({ ...est, beneficios_promedio: Number(e.target.value) })
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate({ to: "/home" })}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}