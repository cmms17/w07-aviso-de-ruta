import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente de Supabase consciente de la sesión (cookies), usado SOLO para
// saber quién está autenticado en /panel. Nunca se usa para leer o
// escribir reportes de excepción — para eso siempre se usa el cliente de
// servicio (crearClienteSupabaseServidor), que ignora RLS a propósito.
export async function crearClienteSupabaseAuth() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llama desde un Server Component sin permiso de escritura;
            // el middleware ya se encarga de refrescar la sesión.
          }
        },
      },
    }
  );
}
