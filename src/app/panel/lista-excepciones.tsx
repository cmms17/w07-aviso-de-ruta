"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcularEstado } from "@/lib/verificacion";

type Excepcion = {
  id: string;
  descripcion: string;
  alias_reportante: string;
  retirado: boolean;
  verificado_manual: boolean;
  creado_en: string;
  expira_en: string;
  numConfirmaciones: number;
};

export default function ListaExcepciones({ excepciones }: { excepciones: Excepcion[] }) {
  const [cargando, setCargando] = useState<string | null>(null);
  const router = useRouter();

  async function moderar(excepcionId: string, accion: "verificar" | "retirar") {
    setCargando(excepcionId + accion);
    const resp = await fetch("/api/panel/moderar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ excepcionId, accion }),
    });
    setCargando(null);
    if (resp.ok) router.refresh();
  }

  if (excepciones.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no hay reportes para esta ruta.</p>;
  }

  return (
    <div className="space-y-3">
      {excepciones.map((e) => {
        const estado = calcularEstado(e.numConfirmaciones, e.retirado, e.verificado_manual);
        return (
          <div key={e.id} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-800">{e.descripcion}</p>
            <p className="text-xs text-slate-500">
              Alias: {e.alias_reportante} · {e.numConfirmaciones} confirmación(es) · reportado{" "}
              {new Date(e.creado_en).toLocaleString("es-MX")}
            </p>
            <p className="text-xs">
              Estado actual:{" "}
              <span
                className={
                  estado === "verificado"
                    ? "text-emerald-700 font-semibold"
                    : estado === "retirado"
                    ? "text-slate-400 font-semibold"
                    : "text-amber-700 font-semibold"
                }
              >
                {estado === "verificado"
                  ? "verificado"
                  : estado === "retirado"
                  ? "retirado"
                  : "sin verificar"}
              </span>
            </p>
            {estado !== "retirado" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => moderar(e.id, "verificar")}
                  disabled={cargando === e.id + "verificar"}
                  className="text-xs font-semibold bg-emerald-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  Verificar
                </button>
                <button
                  onClick={() => moderar(e.id, "retirar")}
                  disabled={cargando === e.id + "retirar"}
                  className="text-xs font-semibold bg-slate-200 text-slate-700 rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  Retirar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
