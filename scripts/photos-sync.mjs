// Local-only pipeline that optimizes photos with sharp, uploads them to
// Supabase Storage, and regenerates src/data/gallery.generated.ts.
//
// NEVER run this in CI: CI has neither credentials nor the source photos.
//
// Usage: node scripts/photos-sync.mjs [sourceDir]
// Source directory resolution order: CLI arg > PHOTOS_SRC_DIR env var > default.
//
// Idempotency: a local cache (scripts/.photos-sync-cache.json, gitignored)
// keyed by the sha256 of each source file skips already-uploaded photos on
// re-runs. If anything fails mid-run, neither the manifest nor the cache is
// written, so a retry reprocesses cleanly from the last successful state.

import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// --- Config -----------------------------------------------------------------

const BUCKET = 'fotografias';
const THUMB_MAX_SIDE = 640;
const THUMB_QUALITY = 75;
const FULL_MAX_SIDE = 1920;
const FULL_QUALITY = 82;
const LQIP_MAX_SIDE = 20;
const LQIP_QUALITY = 40;

// Soft size targets used only to flag outliers in the summary log (some
// high-detail photos may exceed these at the configured quality; adjust
// quality manually for that collection/file if it becomes a recurring issue).
const THUMB_TARGET_BYTES = 100 * 1024;
const FULL_TARGET_BYTES = 400 * 1024;

// Fixed display order for known collections. Collections found on disk but
// not listed here are appended afterwards in alphabetical order. Loose files
// (no collection folder) always go last under the "varias" slug.
const COLLECTION_ORDER = ['40-anos-de-democracia', 'aikido', 'jazzart', 'la-maga-en-el-faro'];
const LOOSE_SLUG = 'varias';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg']);

const DEFAULT_SOURCE_DIR = '/mnt/c/Users/rami_/Desktop/fotografías';
const SOURCE_DIR = path.resolve(
  process.argv[2] ?? process.env.PHOTOS_SRC_DIR ?? DEFAULT_SOURCE_DIR
);

const CACHE_PATH = path.join(__dirname, '.photos-sync-cache.json');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src/data/gallery.generated.ts');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Small helpers ------------------------------------------------------------

// NFD-normalize, strip diacritics, then kebab-case.
// "40 años de democracia" -> "40-anos-de-democracia"
function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Filenames are curated with a leading index ("1-_DSC0072.jpg",
// "12-_DSC0054.jpg", ...); sort by that number so the gallery follows the
// intended order instead of lexicographic order (where "12" < "2").
function naturalCompare(a, b) {
  const numA = Number.parseInt(a, 10);
  const numB = Number.parseInt(b, 10);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) return numA - numB;
  return a.localeCompare(b);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function escapeSingleQuotes(value) {
  return value.replace(/'/g, "\\'");
}

function assertEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in your Supabase project credentials.'
    );
  }
}

// --- Supabase Storage REST calls ----------------------------------------------

async function ensureBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });

  if (res.ok) return;

  const body = await res.text();
  // Supabase Storage has returned this under 400 and 409 across versions;
  // match on the message rather than pinning to one status code.
  const alreadyExists = /already exists/i.test(body);
  if (alreadyExists && (res.status === 400 || res.status === 409)) return;

  throw new Error(`Failed to ensure bucket "${BUCKET}": ${res.status} ${body}`);
}

async function uploadObject(objectPath, buffer, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      'content-type': contentType,
      'cache-control': 'max-age=31536000, immutable',
      'x-upsert': 'true',
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: buffer,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to upload "${objectPath}": ${res.status} ${body}`);
  }
}

function publicUrl(objectPath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

// --- Source discovery -----------------------------------------------------------

// A "collection" is either a subfolder of SOURCE_DIR (named collection) or the
// implicit "varias" group made of loose files sitting directly in SOURCE_DIR.
async function discoverCollections() {
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  const collections = [];
  const looseFiles = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirPath = path.join(SOURCE_DIR, entry.name);
      const files = (await readdir(dirPath))
        .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .sort(naturalCompare);
      if (files.length === 0) continue;
      collections.push({ label: entry.name, slug: slugify(entry.name), dirPath, files });
    } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      looseFiles.push(entry.name);
    }
  }

  const orderIndex = new Map(COLLECTION_ORDER.map((slug, i) => [slug, i]));
  collections.sort((a, b) => {
    const ia = orderIndex.has(a.slug) ? orderIndex.get(a.slug) : Number.POSITIVE_INFINITY;
    const ib = orderIndex.has(b.slug) ? orderIndex.get(b.slug) : Number.POSITIVE_INFINITY;
    if (ia !== ib) return ia - ib;
    return a.label.localeCompare(b.label);
  });

  if (looseFiles.length > 0) {
    looseFiles.sort(naturalCompare);
    collections.push({ label: null, slug: LOOSE_SLUG, dirPath: SOURCE_DIR, files: looseFiles });
  }

  return collections;
}

// --- Image processing -----------------------------------------------------------

// Resizes so the LONGER side fits within maxSide (never upscales), then
// encodes as WebP at the given quality.
async function toWebpVariant(buffer, { maxSide, quality }) {
  return sharp(buffer)
    .rotate() // apply EXIF orientation before resizing
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });
}

// --- Manifest formatting ----------------------------------------------------------

function formatPhotoEntry(photo) {
  const collection =
    photo.collection === null ? 'null' : `'${escapeSingleQuotes(photo.collection)}'`;
  const lqipLine = photo.lqip ? `\n    lqip: '${photo.lqip}',` : '';

  return `  {
    thumbSrc: '${photo.thumbSrc}',
    fullSrc: '${photo.fullSrc}',
    alt: '${escapeSingleQuotes(photo.alt)}',
    width: ${photo.width},
    height: ${photo.height},
    collection: ${collection},${lqipLine}
  },`;
}

function formatManifest(photos) {
  const arrayBody =
    photos.length === 0 ? '[]' : `[\n${photos.map(formatPhotoEntry).join('\n')}\n]`;

  return `// AUTO-GENERATED — no editar a mano
// Generado por scripts/photos-sync.mjs. Para actualizar la galería, correr \`npm run photos:sync\`.

import type { GalleryPhoto } from './photography';

export const galleryManifest: GalleryPhoto[] = ${arrayBody};
`;
}

// --- Cache -------------------------------------------------------------------------

async function loadCache() {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

// --- Main ---------------------------------------------------------------------------

async function main() {
  assertEnv();
  await ensureBucket();

  const cache = await loadCache();
  const nextCache = {};
  const manifestPhotos = [];

  let uploadedCount = 0;
  let cachedCount = 0;
  const thumbRecords = []; // { objectPath, size }
  const fullRecords = [];

  const collections = await discoverCollections();

  for (const collection of collections) {
    let obraIndex = 0;

    for (const fileName of collection.files) {
      obraIndex += 1;
      const filePath = path.join(collection.dirPath, fileName);
      const sourceBuffer = await readFile(filePath);
      const hash = sha256(sourceBuffer);

      // Position-derived fields (object paths, alt text) are recomputed on
      // EVERY run, cache hit or not: they depend on where the file currently
      // sits (collection, sibling order), not on its content. Only the
      // expensive encode+upload work is skipped, and only when the cached
      // object paths still match today's — otherwise the file moved
      // collections or was renamed and must be (re-)uploaded to its new path.
      const baseName = slugify(path.parse(fileName).name);
      const thumbObjectPath = `${collection.slug}/thumbs/${baseName}.webp`;
      const fullObjectPath = `${collection.slug}/${baseName}.webp`;
      // Auto-generated alt text; a manual-override hook (e.g. reading a
      // per-photo descriptions file) can replace this generation later.
      const alt = collection.label
        ? `${collection.label} — obra ${obraIndex}`
        : `Fotografía — obra ${obraIndex}`;

      const cached = cache[hash];
      const canReuse =
        cached &&
        cached.thumbObjectPath === thumbObjectPath &&
        cached.fullObjectPath === fullObjectPath;

      if (canReuse) {
        cachedCount += 1;
        nextCache[hash] = cached;
        manifestPhotos.push({
          thumbSrc: publicUrl(thumbObjectPath),
          fullSrc: publicUrl(fullObjectPath),
          alt,
          width: cached.width,
          height: cached.height,
          collection: collection.label,
          lqip: cached.lqip,
        });
        continue;
      }

      const [thumb, full, lqip] = await Promise.all([
        toWebpVariant(sourceBuffer, { maxSide: THUMB_MAX_SIDE, quality: THUMB_QUALITY }),
        toWebpVariant(sourceBuffer, { maxSide: FULL_MAX_SIDE, quality: FULL_QUALITY }),
        toWebpVariant(sourceBuffer, { maxSide: LQIP_MAX_SIDE, quality: LQIP_QUALITY }),
      ]);

      await uploadObject(thumbObjectPath, thumb.data, 'image/webp');
      await uploadObject(fullObjectPath, full.data, 'image/webp');

      const cacheEntry = {
        thumbObjectPath,
        fullObjectPath,
        width: full.info.width,
        height: full.info.height,
        lqip: `data:image/webp;base64,${lqip.data.toString('base64')}`,
      };

      nextCache[hash] = cacheEntry;
      manifestPhotos.push({
        thumbSrc: publicUrl(thumbObjectPath),
        fullSrc: publicUrl(fullObjectPath),
        alt,
        width: cacheEntry.width,
        height: cacheEntry.height,
        collection: collection.label,
        lqip: cacheEntry.lqip,
      });
      uploadedCount += 1;
      thumbRecords.push({ objectPath: thumbObjectPath, size: thumb.info.size });
      fullRecords.push({ objectPath: fullObjectPath, size: full.info.size });
    }
  }

  await writeFile(MANIFEST_PATH, formatManifest(manifestPhotos), 'utf-8');
  await writeFile(CACHE_PATH, JSON.stringify(nextCache, null, 2), 'utf-8');

  const toKB = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;
  const summarize = (label, records) => {
    if (records.length === 0) return `${label}: (none uploaded this run)`;
    const sizes = records.map((r) => r.size);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    return `${label}: min ${toKB(min)}, max ${toKB(max)}, avg ${toKB(avg)} (${records.length} files)`;
  };
  const warnOversize = (label, records, targetBytes) => {
    const oversized = records.filter((r) => r.size > targetBytes);
    if (oversized.length === 0) return;
    console.log(`  WARNING: ${oversized.length} ${label} file(s) over ${toKB(targetBytes)} target:`);
    for (const r of oversized) {
      console.log(`    ${r.objectPath} — ${toKB(r.size)}`);
    }
  };

  console.log('\nphotos:sync summary');
  console.log(`  uploaded: ${uploadedCount}`);
  console.log(`  cached (skipped): ${cachedCount}`);
  console.log(`  ${summarize('thumb', thumbRecords)}`);
  console.log(`  ${summarize('full', fullRecords)}`);
  warnOversize('thumb', thumbRecords, THUMB_TARGET_BYTES);
  warnOversize('full', fullRecords, FULL_TARGET_BYTES);
  console.log(`  manifest written to ${path.relative(ROOT_DIR, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error('\nphotos:sync failed:', err instanceof Error ? err.message : err);
  console.error('No manifest or cache changes were written for this run.');
  process.exitCode = 1;
});
