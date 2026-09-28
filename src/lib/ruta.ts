// Datos estáticos de la Ruta 24 — inventados para esta demo, etiquetados
// como tal. Esto es lo que Mapatón CDMX ya resuelve para rutas reales: el
// trazo fijo. Mi pieza no reconstruye esto, lo da por hecho.
export const RUTA_ID = "24";
export const RUTA_NOMBRE = "Ruta 24 — Ecatepec → La Presa";

export const PARADAS_FIJAS = [
  { id: "terminal", nombre: "Terminal", lat: 19.6097, lng: -99.0505 },
  { id: "mercado", nombre: "Mercado", lat: 19.6041, lng: -99.0432 },
  { id: "av-central", nombre: "Av. Central", lat: 19.5983, lng: -99.0361 },
  { id: "la-presa", nombre: "La Presa", lat: 19.5928, lng: -99.0288 },
] as const;

export type ParadaId = (typeof PARADAS_FIJAS)[number]["id"];

export function esParadaValida(id: string): id is ParadaId {
  return PARADAS_FIJAS.some((p) => p.id === id);
}
