// Lógica de verificación — determinista y etiquetada, NUNCA un modelo de
// ML real (Dragon Stack, pieza 3, tal como se declara en el Packet y en la
// declaración de TECHNOLOGIST del Blueprint del equipo: "AI is optional...
// no report should automatically become truth").
//
// Regla: un reporte con 2 o más confirmaciones independientes (alias
// distintos, incluyendo quien lo creó) se etiqueta "verificado por la
// comunidad". Con menos, queda "sin verificar" y aparece en la cola del
// coordinador. Un coordinador humano puede verificar o retirar cualquier
// reporte manualmente, sin importar el conteo — la verificación humana
// siempre puede sobreescribir a la comunitaria (Condición 3 del Blueprint).

export const UMBRAL_CONFIRMACIONES = 2;
export const HORAS_EXPIRACION = 24;

export type EstadoExcepcion = "sin_verificar" | "verificado" | "retirado";

export function calcularEstado(
  numConfirmaciones: number,
  retiradoManualmente: boolean,
  verificadoManualmente: boolean
): EstadoExcepcion {
  if (retiradoManualmente) return "retirado";
  if (verificadoManualmente) return "verificado";
  return numConfirmaciones >= UMBRAL_CONFIRMACIONES ? "verificado" : "sin_verificar";
}

export function calcularExpiracion(desde: Date = new Date()): Date {
  return new Date(desde.getTime() + HORAS_EXPIRACION * 60 * 60 * 1000);
}

export function estaActivo(expiraEn: string, retirado: boolean): boolean {
  if (retirado) return false;
  return new Date(expiraEn).getTime() > Date.now();
}
