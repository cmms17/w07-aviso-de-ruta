import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase que usa la Service Role Key. Solo debe importarse
// desde código de servidor (Server Components, Route Handlers). El paquete
// "server-only" hace que el build falle si algún componente de cliente
// intenta importar este archivo. Este es el ÚNICO cliente que lee o escribe
// la tabla de reportes de excepción — nunca se expone directamente al
// navegador. A propósito, ninguna consulta de este archivo ni de ningún
// otro toca una columna de identidad de chofer: esa columna no existe en
// el esquema (Condición 5 del Blueprint — frontera de datos del trabajador).
export function crearClienteSupabaseServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase en el servidor."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
