import { useSyncExternalStore } from 'react';
import { highScoresMarquee, subscribeHighScores } from '../utils/heroPongHighScores';

/** En el prerender no hay tabla que mostrar: el HTML generado no cambia. */
const emptyMarquee = (): string => '';

/**
 * La secuencia del ticker del top-10, leída del storage por el canal que React
 * tiene para estado externo: se actualiza sola cuando se guarda un score nuevo,
 * sin efectos ni sincronización a mano. `''` mientras no haya ninguno.
 */
export function useHighScoresMarquee(): string {
  return useSyncExternalStore(subscribeHighScores, highScoresMarquee, emptyMarquee);
}
