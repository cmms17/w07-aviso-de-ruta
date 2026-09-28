import Link from "next/link";

export default function Inicio() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-bold text-slate-900">Aviso de Ruta</h1>
        <p className="text-sm text-slate-600 mt-2">
          Excepciones operativas de hoy, reportadas y verificadas por la comunidad — no un mapa
          nuevo, solo lo que cambió.
        </p>
        <Link
          href="/ruta/24"
          className="inline-block mt-5 bg-blue-900 text-white rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          Ver Ruta 24
        </Link>
      </div>
    </main>
  );
}
