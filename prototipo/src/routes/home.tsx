import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getEstudiante, recomputeAsignaturas } from "@/lib/store";
import type { Estudiante } from "@/lib/types";

export const Route = createFileRoute("/home")({
  component: () => (
    <Protected>
      <HomePage />
    </Protected>
  ),
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [est, setEst] = useState<Estudiante | null>(null);

  useEffect(() => {
    if (!user) return;
    recomputeAsignaturas(user.uid);
    setEst(getEstudiante(user.uid, user.email ?? ""));
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4 border-b">
        <h1 className="text-lg font-semibold tracking-tight">Inicio</h1>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estudiante</p>
            <h2 className="text-2xl font-semibold">
              {est?.nombres || "Sin nombre"} {est?.apellidos}
            </h2>
            <p className="text-sm text-muted-foreground">Código: {est?.codigo ?? "-"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Stat label="Promedio" value={(est?.promedio_semestral ?? 0).toFixed(2)} />
            <Stat label="Meta becas" value={(est?.beneficios_promedio ?? 0).toFixed(2)} />
          </div>

          <div
            className={`text-sm rounded-md px-3 py-2 ${
              est?.beneficios_cumple
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Beneficios:{" "}
            <span className="font-medium">{est?.beneficios_cumple ? "Sí cumple" : "No cumple"}</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline">
            <Link to="/perfil">Editar perfil</Link>
          </Button>
          <Button asChild>
            <Link to="/asignaturas">Revisar asignaturas</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}