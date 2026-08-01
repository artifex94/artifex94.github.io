// Edge Function: hero-pong-score
//
// El ranking global del juego del home. GET devuelve el top 10; POST registra
// una partida terminada.
//
// LA REGLA QUE IMPORTA (la misma que tufting-order-deposit): el browser no
// manda números en los que haya que confiar. Manda la TRAZA de la partida
// —golpes al techo, letras destruidas, tableros vaciados, duración— y el
// servidor recalcula el techo del score con SUS propias constantes. Un score
// inflado se rechaza igual de bien que una traza inflada, y la traza además
// tiene que ser físicamente posible en el tiempo declarado.
//
// Nada de esto vuelve honesta a una partida: un cliente modificado puede
// simular una traza plausible. Lo que sí garantiza es que mandar "999999" no
// alcance, que es la diferencia entre un ranking y un campo de texto público.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, json, readJsonBody } from '../_shared/http.ts';
// La validación vive aparte para que la suite del sitio la pueda cargar y
// verificar contra el puntaje del cliente (src/utils/heroPongRun.parity.test.ts).
import { validateRun } from '../_shared/heroPongRun.ts';

const TOP_LIMIT = 10;

const topScores = async (supabase) => {
  const { data, error } = await supabase
    .from('hero_pong_scores')
    .select('initials, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(TOP_LIMIT);
  if (error) return null;
  return (data ?? []).map((row) => ({ initials: row.initials, score: row.score }));
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json(req, { error: 'Server misconfigured' }, 500);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (req.method === 'GET') {
    const top = await topScores(supabase);
    if (!top) return json(req, { error: 'unavailable' }, 502);
    return json(req, { top });
  }

  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  const run = validateRun(await readJsonBody(req));
  // Un 422 y no un 400: el cuerpo se entiende, lo que no cierra es la partida.
  if (!run) return json(req, { error: 'partida_invalida' }, 422);

  const before = await topScores(supabase);
  if (!before) return json(req, { error: 'unavailable' }, 502);

  // Solo entra lo que de verdad clasifica: mantiene la tabla chica y le saca
  // sentido a spamear partidas mediocres. Empatar al último NO desplaza.
  const qualifies = before.length < TOP_LIMIT || run.score > before[before.length - 1].score;
  if (!qualifies) return json(req, { top: before, rank: -1 });

  const { error } = await supabase.from('hero_pong_scores').insert({
    initials: run.initials,
    score: run.score,
    ceiling_hits: run.ceilingHits,
    letters_destroyed: run.lettersDestroyed,
    boards_cleared: run.boardsCleared,
    elapsed_ms: run.elapsedMs,
  });
  if (error) return json(req, { error: 'unavailable' }, 502);

  const top = (await topScores(supabase)) ?? before;
  const rank = top.findIndex((row) => row.initials === run.initials && row.score === run.score);
  return json(req, { top, rank });
});
