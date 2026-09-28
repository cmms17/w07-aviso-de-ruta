import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { calcularExpiracion } from "@/lib/verificacion";
import { esParadaValida } from "@/lib/ruta";

const cuerpoEsperado = z.object({
  rutaId: z.string().trim().min(1).max(10),
  paradaId: z.string().trim().max(40).optional(),
  descripcion: z
    .string()
    .trim()
    .min(8, "Describe la excepción con al menos 8 caracteres.")
    .max(200, "Máximo 200 caracteres."),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  alias: z
    .string()
    .trim()
    .min(3, "Usa un alias de al menos 3 caracteres.")
    .max(30)
    .regex(/^[a-zA-Z0-9\-\s]+$/, "Solo letras, números, espacios y guiones — nada de datos personales reales."),
});

// Crea una excepción nueva. Público, sin cuenta. La ubicación viene del
// GPS del navegador de quien reporta (Dragon Stack, pieza de telemetría) —
// nunca se pide ni se guarda la identidad de ningún chofer, esa columna no
// existe en el esquema (Condición 5 del Blueprint).
export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const resultado = cuerpoEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 }
    );
  }
  const { rutaId, paradaId, descripcion, lat, lng, alias } = resultado.data;

  if (paradaId && !esParadaValida(paradaId)) {
    return NextResponse.json({ error: "Parada no reconocida." }, { status: 400 });
  }

  try {
    const supabase = crearClienteSupabaseServidor();
    const expiraEn = calcularExpiracion();

    const { data: excepcion, error: errorInsert } = await supabase
      .from("excepciones")
      .insert({
        ruta_id: rutaId,
        parada_id: paradaId ?? null,
        descripcion,
        lat,
        lng,
        alias_reportante: alias,
        expira_en: expiraEn.toISOString(),
      })
      .select("id")
      .single();

    if (errorInsert || !excepcion) {
      console.error("Error guardando excepción:", errorInsert?.message);
      return NextResponse.json(
        { error: "No se pudo guardar el reporte." },
        { status: 500 }
      );
    }

    // La primera confirmación es la de quien reportó — así el conteo de
    // confirmaciones independientes empieza en 1, no en 0.
    const { error: errorConfirmar } = await supabase
      .from("confirmaciones")
      .insert({ excepcion_id: excepcion.id, alias });

    if (errorConfirmar) {
      console.error("Error registrando confirmación inicial:", errorConfirmar.message);
    }

    return NextResponse.json({
      id: excepcion.id,
      estado: "sin_verificar",
      etiqueta: "Reporte comunitario, sin verificar oficialmente.",
      expiraEn: expiraEn.toISOString(),
    });
  } catch (err) {
    console.error("Error reportando excepción:", err);
    return NextResponse.json(
      {
        error: "El servidor no pudo guardar tu reporte. Intenta de nuevo en un momento.",
      },
      { status: 500 }
    );
  }
}
