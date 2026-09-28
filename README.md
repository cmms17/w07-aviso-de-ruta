# Aviso de Ruta (w07)

Business Bending · Cristina Meouchi (USER) · Repair Flow, Crystal Ball Studio · Team 8

Ataca el vacío "Narrow Driver-knowledge / operational exception information" declarado en el
Blueprint del equipo: una sola ruta acotada (Ruta 24, datos ficticios), donde cualquier persona
reporta excepciones operativas de hoy (paradas cerradas, desvíos) sin cuenta, con ubicación GPS
capturada al reportar. Cada reporte queda "sin verificar" hasta 2+ confirmaciones independientes
o revisión de un coordinador humano, y caduca solo a las 24h si nadie lo renueva. El esquema no
tiene ninguna columna que identifique a un chofer — es una decisión de diseño, no una política.

Ver `docs/PACKET.md` para el detalle completo (problema, usuaria exacta, benchmark, scope cut,
arquitectura y plan de pruebas).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase (Postgres, RLS, Auth) + Vercel.

## Rutas

- `/ruta/24` — pública, sin cuenta. Ver y reportar excepciones.
- `/panel` — coordinador, requiere Supabase Auth (creado a mano en Supabase, sin registro público).

## Setup local

```bash
npm install
cp .env.example .env.local   # llenar con las llaves reales de Supabase
npm run dev
```

## Base de datos

1. Correr `supabase/migrations/20260928000000_esquema_aviso_de_ruta.sql` en el SQL Editor de Supabase.
2. Opcional: correr `supabase/seed_demo.sql` para datos de ejemplo (inventados, etiquetados).
3. Crear a mano un usuario de Auth (correo/contraseña) para el coordinador de la Ruta 24.
