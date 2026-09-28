import { redirect } from "next/navigation";
import { crearClienteSupabaseAuth } from "@/lib/supabase/server-auth";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import CerrarSesion from "./cerrar-sesion";
import ListaExcepciones from "./lista-excepciones";

export default async function PanelCoordinador() {
  const supabaseAuth = await crearClienteSupabaseAuth();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect("/panel/login");
  }

  const supabase = crearClienteSupabaseServidor();
  const { data: excepciones } = await supabase
    .from("excepciones")
    .select("id, descripcion, lat, lng, alias_reportante, retirado, verificado_manual, creado_en, expira_en")
    .eq("ruta_id", "24")
    .order("creado_en", { ascending: false });

  const conConteo = await Promise.all(
    (excepciones ?? []).map(async (e) => {
      const { count } = await supabase
        .from("confirmaciones")
        .select("*", { count: "exact", head: true })
        .eq("excepcion_id", e.id);
      return { ...e, numConfirmaciones: count ?? 0 };
    })
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Panel del coordinador — Ruta 24</h1>
            <p className="text-xs text-slate-500">
              Ninguna fila identifica a un chofer — esa columna no existe en el esquema.
            </p>
          </div>
          <CerrarSesion />
        </div>
        <ListaExcepciones excepciones={conConteo} />
      </div>
    </main>
  );
}
