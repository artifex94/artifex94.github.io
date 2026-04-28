/**
 * fetch-platzi.mjs
 *
 * Obtiene todos los diplomas del perfil público de Platzi usando la API REST
 * descubierta en los bundles JS: /students/v1/diplomas/{username}/
 *
 * Ejecutar manualmente : node scripts/fetch-platzi.mjs
 * Ejecutar en build    : se activa automáticamente via "prebuild" en package.json
 * Debug HTML           : DEBUG=1 node scripts/fetch-platzi.mjs
 */

import { writeFileSync, existsSync } from 'fs';

const PLATZI_USERNAME = 'Ramiroesc18';
const OUTPUT_FILE     = 'src/data/platzi-certs.json';
const PAGE_SIZE       = 100; // máximo seguro por página

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':     'application/json',
  'Referer':    `https://platzi.com/p/${PLATZI_USERNAME}/`,
};

// ── school inference ───────────────────────────────────────────────────────

function slugToSchool(slug = '', title = '') {
  const s = (slug + ' ' + title).toLowerCase();

  if (/electronica|circuito|hardware|electric/.test(s))      return 'Electrónica';
  if (/ethereum|bitcoin|blockchain|web3|criptomoneda/.test(s)) return 'Blockchain & Web3';
  if (/react|nextjs|next\.js|angular|vue|svelte|frontend|javascript|typescript|nodejs|node\.js|npm|async|asincron|css|html|navegador|clean.code/.test(s))
                                                               return 'Escuela de JavaScript';
  if (/python|django|flask/.test(s))                         return 'Escuela de Python';
  if (/\bjava\b(?!script)|spring/.test(s))                   return 'Escuela de Java';
  if (/backend|desarrollo.web/.test(s))                      return 'Escuela de Desarrollo Web';
  if (/datos|data.science|sql|postgres|mysql|mongodb/.test(s)) return 'Escuela de Datos';
  if (/dise[nñ]o|figma|(?<![a-z])ui(?![a-z])|(?<![a-z])ux(?![a-z])|programador/.test(s))
                                                               return 'Escuela de Diseño';
  if (/git|devops|docker|cloud|linux|terminal|l[ií]nea.de.comandos|prework|entorno|windows|configuraci[oó]n/.test(s))
                                                               return 'Escuela de DevOps';
  if (/english|ingl[eé]s/.test(s))                           return 'Escuela de Inglés';
  if (/startup|emprendimiento|negocio|marketing|gesti[oó]n|tiempo/.test(s))
                                                               return 'Escuela de Negocios';
  if (/gemini|chatgpt|llm|inteligencia.artificial|machine.learning/.test(s))
                                                               return 'Escuela de IA';
  if (/pensamiento.l[oó]gico|algoritmo|matem[aá]tica|computaci[oó]n|l[oó]gica/.test(s))
                                                               return 'Fundamentos';
  if (/aprender|productividad|estudio/.test(s))              return 'Habilidades Blandas';
  return 'Platzi';
}

function normalizeCert(raw) {
  return {
    name:        raw.title || '',
    school:      slugToSchool(raw.slug || '', raw.title || ''),
    completedAt: raw.diploma?.approved_date ?? null,
    url:         raw.diploma?.diploma_url   ?? null,
    imageUrl:    raw.badge_url              ?? null,
  };
}

// ── Strategy 1: direct REST API ────────────────────────────────────────────
// Endpoint descubierto en los bundles JS de Platzi (sin autenticación requerida):
// GET /students/v1/diplomas/{username}/?page={n}&page_size={size}

async function fetchAllViaAPI() {
  const allCourses = [];
  let page = 1;

  while (true) {
    const url = `https://platzi.com/students/v1/diplomas/${PLATZI_USERNAME}/?page=${page}&page_size=${PAGE_SIZE}`;
    console.log(`[Platzi] API page ${page}: ${url}`);

    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);

    const json = await res.json();
    const courses  = json.data?.courses ?? [];
    const meta     = json.metadata ?? {};

    allCourses.push(...courses);
    console.log(`[Platzi]   → ${courses.length} certs | total so far: ${allCourses.length} | pages: ${meta.current_page}/${meta.pages}`);

    if (!meta.pages || meta.current_page >= meta.pages) break;
    page++;
  }

  return allCourses;
}

// ── Strategy 2: RSC fallback (Next.js App Router payload) ─────────────────
// Usado si la API REST no está disponible. Solo retorna los ~9 "defaultCertificates"
// que aparecen en el render inicial de la página.

function extractRSCFlightData(html) {
  const chunks = [];
  const re = /self\.__next_f\.push\((\[[\s\S]*?\])\)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { chunks.push(JSON.parse(m[1])); } catch { /* skip */ }
  }
  return chunks.filter(c => c[0] === 1).map(c => c[1]).join('');
}

function findInObj(obj, depth = 0) {
  if (depth > 15 || !obj) return null;
  if (Array.isArray(obj)) {
    for (const item of obj) { const r = findInObj(item, depth + 1); if (r) return r; }
  } else if (typeof obj === 'object') {
    if (Array.isArray(obj.defaultCertificates) && obj.defaultCertificates.length > 0)
      return obj.defaultCertificates;
    for (const val of Object.values(obj)) { const r = findInObj(val, depth + 1); if (r) return r; }
  }
  return null;
}

async function fetchViaRSC() {
  const res = await fetch(`https://platzi.com/p/${PLATZI_USERNAME}/`, {
    headers: {
      ...FETCH_HEADERS,
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  if (process.env.DEBUG) {
    writeFileSync('platzi-debug.html', html, 'utf-8');
    console.log('[Platzi] Raw HTML saved to platzi-debug.html');
  }

  const flight = extractRSCFlightData(html);
  const lines  = flight.split('\n');

  for (const line of lines) {
    if (!line.includes('defaultCertificates')) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    try {
      const parsed = JSON.parse(line.slice(colonIdx + 1));
      const certs  = findInObj(parsed);
      if (certs?.length > 0) return certs;
    } catch { /* skip */ }
  }
  return null;
}

// ── save ───────────────────────────────────────────────────────────────────

function saveCerts(rawList) {
  const normalized = rawList
    .filter(c => c.progress === 100 || c.diploma?.diploma_url)
    .map(normalizeCert)
    .filter(c => c.name.length > 0);

  writeFileSync(OUTPUT_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
  console.log(`[Platzi] ✓ ${normalized.length} certifications saved → ${OUTPUT_FILE}`);
  return normalized.length;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  // --- Strategy 1: direct API (preferred, returns all certs) ---
  try {
    const courses = await fetchAllViaAPI();
    if (courses.length > 0) {
      saveCerts(courses);
      return;
    }
    console.warn('[Platzi] API returned 0 courses, trying RSC fallback...');
  } catch (err) {
    console.warn(`[Platzi] API strategy failed: ${err.message}. Trying RSC fallback...`);
  }

  // --- Strategy 2: RSC HTML scraping (fallback, ~9 certs only) ---
  try {
    const courses = await fetchViaRSC();
    if (courses?.length > 0) {
      console.log(`[Platzi] RSC fallback: ${courses.length} certs found`);
      saveCerts(courses);
      return;
    }
  } catch (err) {
    console.warn(`[Platzi] RSC fallback failed: ${err.message}`);
  }

  console.error('[Platzi] All strategies failed. Check your internet connection or profile URL.');
  if (!existsSync(OUTPUT_FILE)) writeFileSync(OUTPUT_FILE, '[]', 'utf-8');
  process.exit(1);
}

main().catch(err => {
  console.error('[Platzi] Fatal:', err);
  process.exit(1);
});
