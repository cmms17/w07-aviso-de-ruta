-- Datos de ejemplo, inventados y etiquetados como tal — ninguna persona
-- real, ninguna combi real, ningún chofer real (piso de seguridad).
-- Correr manualmente en el SQL Editor de Supabase tras aplicar la migración.

insert into excepciones (ruta_id, parada_id, descripcion, lat, lng, alias_reportante, expira_en)
values
  ('24', 'av-central', 'Parada Av. Central cerrada por obra', 19.5983, -99.0361, 'vecina-01', now() + interval '24 hours'),
  ('24', 'terminal', 'Combi desvía por Mercado, no entra a Terminal después de las 8pm', 19.6097, -99.0505, 'vecino-02', now() + interval '24 hours');

-- La segunda excepción ya tiene 2 confirmaciones independientes, para que
-- se vea el estado "verificado por la comunidad" desde el primer vistazo.
insert into confirmaciones (excepcion_id, alias)
select id, 'vecino-02' from excepciones where descripcion like 'Combi desvía%';
insert into confirmaciones (excepcion_id, alias)
select id, 'vecina-03' from excepciones where descripcion like 'Combi desvía%';
insert into confirmaciones (excepcion_id, alias)
select id, 'vecina-01' from excepciones where descripcion like 'Parada Av. Central%';
