"use client";
import { useRouter } from "next/navigation";
import { crearClienteSupabaseNavegador } from "@/lib/supabase/client";

export default function CerrarSesion() {
  const router = useRouter();
  const supabase = crearClienteSupabaseNavegador();

  async function salir() {
    await supabase.auth.signOut();
    router.push("/panel/login");
    router.refresh();
  }

  return (
    <button
      onClick={salir}
      className="text-sm text-slate-500 hover:text-slate-800 underline"
    >
      Cerrar sesión
    </button>
  );
}
