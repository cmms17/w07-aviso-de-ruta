import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseAuth } from "@/lib/supabase/server-auth";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

const cuerpoEsperado = z.object({
  excepcionId: z.string().uuid(),
  accion: z.enum(["verificar", "retirar"]),
});

// Acción de moderación del coordinador — requiere sesión de Supabase Auth.
// Un coordinador puede verificar manualmente (sobreescribe el conteo
// comunitario) o retirar un reporte. Nunca ve, filtra ni puede introducir
// una identidad de chofer: la columna no existe en el esquema.
export async function POST(request: Request) {
  const supabaseAuth = await crearClienteSupabaseAuth();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida. Inicia sesión de nuevo." }, { status: 401 });
  }

  const cuerpo = await request.json().catch(() => null);
  const resultado = cuerpoEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const { excepcionId, accion } = resultado.data;

  try {
    const supabase = crearClienteSupabaseServidor();
    const cambios =
      accion === "verificar"
        ? { verificado_manual: true, retirado: false }
        : { retirado: true };

    const { error } = await supabase.from("excepciones").update(cambios).eq("id", excepcionId);

    if (error) {
      console.error("Error moderando excepción:", error.message);
      return NextResponse.json({ error: "No se pudo aplicar la acción." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/panel/moderar:", err);
    return NextResponse.json({ error: "El servidor no pudo aplicar la acción." }, { status: 500 });
  }
}
