-- Ranking global del hero-pong.
--
-- La tabla NO se expone a PostgREST. Dos candados, porque RLS sola no alcanza:
-- con RLS activo y sin policies una consulta anónima igual responde 200 con
-- lista vacía, así que además se le revocan los privilegios a `anon` y
-- `authenticated` y la consulta directa pasa a ser "permission denied".
--
-- El único camino es la edge function `hero-pong-score`, que usa la service
-- role key (que saltea RLS) y es la que valida. Con esto el sitio no necesita
-- ninguna clave de Supabase en el bundle.

create table if not exists public.hero_pong_scores (
  id uuid primary key default gen_random_uuid(),
  -- Tres letras, estilo recreativa.
  initials text not null check (initials ~ '^[A-Z]{3}$'),
  score integer not null check (score > 0),
  -- Traza cruda de la partida: es lo que hace verificable al score.
  ceiling_hits integer not null check (ceiling_hits >= 0),
  letters_destroyed integer not null check (letters_destroyed >= 0),
  boards_cleared integer not null check (boards_cleared >= 0),
  elapsed_ms integer not null check (elapsed_ms > 0),
  created_at timestamptz not null default now(),

  -- La invariante que hace imposible un score inventado, incluso si alguien
  -- consiguiera escribir de forma directa: romper dígitos del contador solo
  -- puede bajar el score, así que nunca puede superar lo que la traza permite.
  constraint hero_pong_scores_score_within_run
    check (score <= ceiling_hits + letters_destroyed * 100 + boards_cleared * 10000)
);

-- El top 10 se lee por score desc; los empates los desempata el más viejo, que
-- es la convención arcade (el que llegó primero conserva el puesto).
create index if not exists hero_pong_scores_top
  on public.hero_pong_scores (score desc, created_at asc);

alter table public.hero_pong_scores enable row level security;

-- Sin policies a propósito: ver el comentario de cabecera. `service_role`
-- saltea RLS, y es la única identidad que toca esta tabla.
revoke all on table public.hero_pong_scores from anon, authenticated;
