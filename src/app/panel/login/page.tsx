"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabaseNavegador } from "@/lib/supabase/client";

export default function LoginPanel() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const supabase = crearClienteSupabaseNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={alEnviar}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-bold text-slate-900">Panel del coordinador</h1>
          <p className="text-sm text-slate-500">Ruta 24 — Aviso de Ruta</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Correo</label>
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-900 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60"
        >
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
