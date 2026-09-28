import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { calcularEstado, calcularExpiracion, UMBRAL_CONFIRMACIONES } from "@/lib/verificacion";

const cuerpoEsperado = z.object({
  excepcionId: z.string().uuid("Excepción no reconocida."),
  alias: z
    .string()
    .trim()
    .min(3, "Usa un alias de al menos 3 caracteres.")
    .max(30)
    .regex(/^[a-zA-Z0-9\-\s]+$/, "Solo letras, números, espacios y guiones."),
});

// Confirma una excepción existente desde un alias distinto. Cada alias
// solo puede confirmar una vez por excepción (constraint UNIQUE en la
// tabla) — así "2 confirmaciones" significa 2 personas distintas, no la
// misma persona insistiendo. Al llegar al umbral, el reporte se renueva
// (Condición 3: un reporte caduca solo si nadie lo confirma de nuevo).
export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const resultado = cuerpoEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 }
    );
  }
  const { excepcionId, alias } = resultado.data;

  try {
    const supabase = crearClienteSupabaseServidor();

    const { data: excepcion, error: errorBusqueda } = await supabase
      .from("excepciones")
      .select("id, retirado, verificado_manual")
      .eq("id", excepcionId)
      .maybeSingle();

    if (errorBusqueda || !excepcion || excepcion.retirado) {
      return NextResponse.json({ error: "Esta excepción ya no está activa." }, { status: 404 });
    }

    const { error: errorInsert } = await supabase
      .from("confirmaciones")
      .insert({ excepcion_id: excepcionId, alias });

    if (errorInsert) {
      // Violación de UNIQUE(excepcion_id, alias) = esta persona ya había confirmado.
      if (errorInsert.code === "23505") {
        return NextResponse.json(
          { error: "Ya confirmaste esta excepción con este alias." },
          { status: 409 }
        );
      }
      console.error("Error registrando confirmación:", errorInsert.message);
      return NextResponse.json({ error: "No se pudo registrar tu confirmación." }, { status: 500 });
    }

    const { count } = await supabase
      .from("confirmaciones")
      .select("*", { count: "exact", head: true })
      .eq("excepcion_id", excepcionId);

    const numConfirmaciones = count ?? 0;
    const estado = calcularEstado(numConfirmaciones, false, excepcion.verificado_manual);
    const nuevaExpiracion = calcularExpiracion();

    await supabase
      .from("excepciones")
      .update({ expira_en: nuevaExpiracion.toISOString() })
      .eq("id", excepcionId);

    return NextResponse.json({
      estado,
      numConfirmaciones,
      umbral: UMBRAL_CONFIRMACIONES,
      expiraEn: nuevaExpiracion.toISOString(),
    });
  } catch (err) {
    console.error("Error confirmando excepción:", err);
    return NextResponse.json(
      { error: "El servidor no pudo registrar tu confirmación. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
