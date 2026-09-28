import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aviso de Ruta — Ruta 24",
  description: "Excepciones operativas de hoy para la Ruta 24, reportadas y verificadas por la comunidad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
