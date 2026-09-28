import { NextResponse } from "next/server";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { calcularEstado, estaActivo } from "@/lib/verificacion";

// Lista las excepciones activas de una ruta. Público, sin cuenta — esto es
// justo lo que Rosa necesita ver antes de salir de su casa. Nunca se
// expone aquí ningún dato de chofer porque la columna no existe.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rutaId = searchParams.get("ruta");

  if (!rutaId) {
    return NextResponse.json({ error: "Falta el parámetro ruta." }, { status: 400 });
  }

  try {
    const supabase = crearClienteSupabaseServidor();

    const { data: excepciones, error } = await supabase
      .from("excepciones")
      .select("id, parada_id, descripcion, lat, lng, creado_en, expira_en, retirado, verificado_manual")
      .eq("ruta_id", rutaId)
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error consultando excepciones:", error.message);
      return NextResponse.json(
        { error: "No se pudieron consultar las excepciones. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const activas = (excepciones ?? []).filter((e) => estaActivo(e.expira_en, e.retirado));

    const resultado = await Promise.all(
      activas.map(async (e) => {
        const { count } = await supabase
          .from("confirmaciones")
          .select("*", { count: "exact", head: true })
          .eq("excepcion_id", e.id);

        const numConfirmaciones = count ?? 0;
        const estado = calcularEstado(numConfirmaciones, false, e.verificado_manual);

        return {
          id: e.id,
          paradaId: e.parada_id,
          descripcion: e.descripcion,
          lat: e.lat,
          lng: e.lng,
          creadoEn: e.creado_en,
          expiraEn: e.expira_en,
          numConfirmaciones,
          estado,
        };
      })
    );

    return NextResponse.json({ excepciones: resultado });
  } catch (err) {
    console.error("Error listando excepciones:", err);
    return NextResponse.json(
      { error: "El servidor no pudo cargar las excepciones. Intenta de nuevo en un momento." },
      { status: 500 }
    );
  }
}
