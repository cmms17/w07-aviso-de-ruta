"use client";
import { useEffect, useState, useCallback } from "react";
import { PARADAS_FIJAS, RUTA_NOMBRE, RUTA_ID } from "@/lib/ruta";

type Excepcion = {
  id: string;
  paradaId: string | null;
  descripcion: string;
  creadoEn: string;
  expiraEn: string;
  numConfirmaciones: number;
  estado: "sin_verificar" | "verificado" | "retirado";
};

function horasRestantes(expiraEn: string) {
  const ms = new Date(expiraEn).getTime() - Date.now();
  if (ms <= 0) return "caducando";
  const horas = Math.floor(ms / (60 * 60 * 1000));
  const minutos = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${horas}h ${minutos}min`;
}

export default function PaginaRuta() {
  const [excepciones, setExcepciones] = useState<Excepcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForma, setMostrarForma] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [alias, setAlias] = useState("");
  const [paradaId, setParadaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarExcepciones = useCallback(async () => {
    try {
      const resp = await fetch(`/api/excepciones?ruta=${RUTA_ID}`);
      const datos = await resp.json();
      if (resp.ok) setExcepciones(datos.excepciones ?? []);
    } catch {
      setMensaje("No se pudo cargar la información. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Carga única al montar; no hay dependencias externas que cambien y
    // vuelvan a disparar esto en bucle, así que no hay cascada de renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarExcepciones();
  }, [cargarExcepciones]);

  async function confirmar(excepcionId: string) {
    const aliasConfirmador = window.prompt("Tu alias para confirmar (no uses tu nombre real):");
    if (!aliasConfirmador) return;
    const resp = await fetch("/api/excepciones/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ excepcionId, alias: aliasConfirmador }),
    });
    const datos = await resp.json();
    if (resp.ok) {
      setMensaje("Gracias, tu confirmación quedó registrada.");
      cargarExcepciones();
    } else {
      setMensaje(datos.error ?? "No se pudo registrar tu confirmación.");
    }
  }

  async function enviarReporte(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (!navigator.geolocation) {
      setMensaje("Tu navegador no puede compartir tu ubicación. No se puede reportar sin ella.");
      return;
    }

    setEnviando(true);
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const resp = await fetch("/api/excepciones/reportar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rutaId: RUTA_ID,
            paradaId: paradaId || undefined,
            descripcion,
            alias,
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude,
          }),
        });
        const datos = await resp.json();
        setEnviando(false);
        if (resp.ok) {
          setMensaje("Reporte guardado como \"sin verificar\". Gracias por avisar.");
          setDescripcion("");
          setMostrarForma(false);
          cargarExcepciones();
        } else {
          setMensaje(datos.error ?? "No se pudo guardar tu reporte.");
        }
      },
      () => {
        setEnviando(false);
        setMensaje("Necesitamos tu ubicación para guardar el reporte en el lugar correcto.");
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white px-5 pt-6 pb-5">
        <p className="text-[11px] tracking-wide uppercase opacity-75">Aviso de Ruta · sin cuenta</p>
        <h1 className="text-xl font-bold mt-1">{RUTA_NOMBRE}</h1>
        <p className="text-xs opacity-85 mt-1">Paradas fijas + excepciones de hoy</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-2">
        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <h2 className="text-sm font-bold text-slate-800 mb-2">Paradas fijas</h2>
          <ul className="flex flex-wrap gap-2">
            {PARADAS_FIJAS.map((p) => (
              <li
                key={p.id}
                className="text-xs bg-slate-100 text-slate-700 rounded-full px-3 py-1"
              >
                {p.nombre}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between mt-5 mb-2">
          <h2 className="text-sm font-bold text-slate-800">Excepciones activas hoy</h2>
          <span className="text-xs text-slate-500">{excepciones.length}</span>
        </div>

        {cargando && <p className="text-sm text-slate-500">Cargando...</p>}
        {!cargando && excepciones.length === 0 && (
          <p className="text-sm text-slate-500">No hay excepciones reportadas hoy en esta ruta.</p>
        )}

        <div className="space-y-3">
          {excepciones.map((exc) => (
            <div key={exc.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold text-slate-800">{exc.descripcion}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                    exc.estado === "verificado"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {exc.estado === "verificado" ? "VERIFICADO POR LA COMUNIDAD" : "SIN VERIFICAR"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {exc.numConfirmaciones} confirmación(es) · caduca en {horasRestantes(exc.expiraEn)}
              </p>
              <button
                onClick={() => confirmar(exc.id)}
                className="text-xs text-blue-800 font-semibold underline mt-2"
              >
                Yo también lo vi — confirmar
              </button>
            </div>
          ))}
        </div>

        {mensaje && (
          <p className="text-xs text-slate-700 bg-slate-100 rounded-lg p-3 mt-4">{mensaje}</p>
        )}

        {!mostrarForma ? (
          <button
            onClick={() => setMostrarForma(true)}
            className="w-full bg-blue-900 text-white rounded-xl py-3 text-sm font-bold mt-5"
          >
            + Reportar una excepción
          </button>
        ) : (
          <form onSubmit={enviarReporte} className="bg-white rounded-xl shadow p-4 mt-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ¿Qué cambió hoy?
              </label>
              <textarea
                required
                minLength={8}
                maxLength={200}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Ej: la parada de Av. Central está cerrada por obra"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Parada más cercana (opcional)
              </label>
              <select
                value={paradaId}
                onChange={(e) => setParadaId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Elegir --</option>
                {PARADAS_FIJAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tu alias (no tu nombre real)
              </label>
              <input
                required
                minLength={3}
                maxLength={30}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Ej: vecina-04"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Vamos a usar tu ubicación actual solo para ubicar este reporte en el mapa. Ningún
              reporte identifica a un chofer.
            </p>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar reporte"}
              </button>
              <button
                type="button"
                onClick={() => setMostrarForma(false)}
                className="text-sm text-slate-500 px-3"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-6">
          Todo reporte es comunitario, puede caducar y puede ser corregido por un coordinador
          humano. Ningún reporte identifica a un chofer.
        </p>
      </div>
    </main>
  );
}
