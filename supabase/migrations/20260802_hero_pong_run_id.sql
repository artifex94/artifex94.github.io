-- Idempotencia del alta de scores.
--
-- Sin esto, mandar la misma partida dos veces (doble toque, reintento tras un
-- timeout, o un efecto de React que reabre la pantalla de iniciales) deja dos
-- filas idénticas en el ranking. Pasó en producción.

alter table public.hero_pong_scores
  add column if not exists run_id text;

-- Único SIN predicado, y esto importa: un índice PARCIAL no sirve como árbitro
-- de `ON CONFLICT` salvo que la sentencia repita su `where`, y PostgREST no lo
-- emite — con el índice parcial cada alta con `run_id` moría en 502.
--
-- No hace falta el parcial de todos modos: en Postgres cada NULL es distinto de
-- los demás, así que los clientes viejos que postean sin `run_id` conviven sin
-- chocar entre sí.
drop index if exists hero_pong_scores_run_id_unique;
create unique index if not exists hero_pong_scores_run_id_unique
  on public.hero_pong_scores (run_id);
