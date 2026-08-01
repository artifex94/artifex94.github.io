// Base de las edge functions del sitio.
//
// Vive aparte de quien las consume porque ya hay dos mundos que las usan
// (el checkout de tufting y el ranking del juego del home) y no tienen por qué
// importarse entre sí: cada uno arrastraría el chunk del otro.

const DEFAULT_FUNCTIONS_URL = 'https://erjyzhefwndkumadlpzr.supabase.co/functions/v1';

/**
 * Se puede sobreescribir con VITE_SUPABASE_FUNCTIONS_URL en el build. Ojo: todo
 * lo que empieza con VITE_ termina en el bundle y es público por definición —
 * ahí solo puede ir la URL, nunca una credencial.
 */
export const FUNCTIONS_URL =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? DEFAULT_FUNCTIONS_URL;
