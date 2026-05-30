import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "login" | "register" | "reset";

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home", replace: true });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Cuenta creada");
      } else {
        await sendPasswordResetEmail(auth, email);
        toast.success("Correo de recuperación enviado");
        setMode("login");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "Restablecer";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6 space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "reset"
              ? "Te enviaremos un correo para restablecer tu contraseña."
              : "Gestiona tus asignaturas y evaluaciones."}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy
              ? "Procesando…"
              : mode === "login"
                ? "Ingresar"
                : mode === "register"
                  ? "Registrar"
                  : "Enviar correo"}
          </Button>
        </form>
        <div className="flex justify-between text-xs text-muted-foreground">
          {mode !== "login" ? (
            <button type="button" className="hover:underline" onClick={() => setMode("login")}>
              Volver al login
            </button>
          ) : (
            <>
              <button type="button" className="hover:underline" onClick={() => setMode("register")}>
                Crear cuenta
              </button>
              <button type="button" className="hover:underline" onClick={() => setMode("reset")}>
                Restablecer contraseña
              </button>
            </>
          )}
        </div>
        <Link to="/" className="hidden" />
      </Card>
    </div>
  );
}