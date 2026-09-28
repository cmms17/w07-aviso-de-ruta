import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

// Condición 6 del Blueprint: "la persona que genera el conocimiento no
// debe desaparecer de la gobernanza — debe poder inspeccionar y corregir
// su información." Sin cuentas, la forma más simple de cumplir esto es
// dejar que cualquiera consulte (y retire) SUS PROPIOS reportes buscando
// por el mismo alias con el que los creó.
const cuerpoEsperado = z.object({
  alias: z.string().trim().min(3).max(30),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alias = searchParams.get("alias");
  const parsed = cuerpoEsperado.safeParse({ alias });
  if (!parsed.success) {
    return NextResponse.json({ error: "Alias inválido." }, { status: 400 });
  }

  try {
    const supabase = crearClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("excepciones")
      .select("id, ruta_id, descripcion, creado_en, expira_en, retirado")
      .eq("alias_reportante", parsed.data.alias)
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error consultando mis reportes:", error.message);
      return NextResponse.json({ error: "No se pudo consultar tus reportes." }, { status: 500 });
    }

    return NextResponse.json({ reportes: data ?? [] });
  } catch (err) {
    console.error("Error en /mias:", err);
    return NextResponse.json({ error: "El servidor no pudo consultar tus reportes." }, { status: 500 });
  }
}

const retiroEsperado = z.object({
  excepcionId: z.string().uuid(),
  alias: z.string().trim().min(3).max(30),
});

// Retira (soft-delete) un reporte, solo si el alias coincide con quien lo
// creó — esto es la parte de "corregir" de la Condición 6.
export async function DELETE(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const resultado = retiroEsperado.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const { excepcionId, alias } = resultado.data;

  try {
    const supabase = crearClienteSupabaseServidor();
    const { data, error } = await supabase
      .from("excepciones")
      .update({ retirado: true })
      .eq("id", excepcionId)
      .eq("alias_reportante", alias)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error retirando reporte:", error.message);
      return NextResponse.json({ error: "No se pudo retirar el reporte." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "No encontramos un reporte tuyo con ese alias." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en DELETE /mias:", err);
    return NextResponse.json({ error: "El servidor no pudo retirar el reporte." }, { status: 500 });
  }
}
