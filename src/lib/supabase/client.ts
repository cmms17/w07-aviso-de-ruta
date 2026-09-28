"use client";
import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para el navegador. Solo se usa para el login del
// panel del coordinador (/panel) — nunca para leer o escribir reportes de
// excepción, eso siempre pasa por el servidor con la Service Role Key.
export function crearClienteSupabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
