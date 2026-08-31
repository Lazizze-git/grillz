/**
 * Pré-calcule les pages du site avec le contenu publié.
 *
 * Le navigateur d'un visiteur reçoit ainsi les bons textes et les bonnes
 * photos dès la première image de la page : plus d'ancienne photo affichée
 * le temps que le CMS réponde, plus de double téléchargement, et les moteurs
 * de recherche lisent le vrai contenu plutôt que celui écrit en dur.
 *
 * Le moteur de liaison n'est pas réécrit ici : ce sont les fichiers du site
 * (js/cms-*.js) qui sont exécutés dans un DOM simulé. Une seule logique,
 * aucun risque de divergence entre ce qui est calculé et ce qui s'exécute
 * chez le visiteur.
 *
 *   node scripts/prerender.mjs [dossier-de-sortie]
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "../..");
const OUT = resolve(process.argv[2] || join(SITE, "dist"));

const PAGES = ["index.html", "savoir-faire.html", "processus.html", "galerie.html", "contact.html"];

/* Ce qui part sur le serveur en plus des pages. */
const STATIC = ["css", "js", "assets", "envoi.php", "spam-filter.php", ".htaccess", "robots.txt", "sitemap.xml", "favicon.svg"];

/* Le moteur de liaison du site, dans son ordre de chargement. */
const ENGINE = ["js/cms-client.js", "js/cms-gallery.js", "js/cms-content.js"];

/**
 * Une seule requête pour toutes les pages : la réponse est mise de côté.
 * L'adresse mise en cache par Sanity est remplacée par l'adresse directe —
 * au moment d'une publication, le cache peut encore servir l'état précédent.
 */
let cached = null;
async function fetchOnce(url) {
  if (!cached && process.env.PRERENDER_FIXTURE) {
    /* Permet de vérifier le rendu sans réseau, à partir d'un contenu de test. */
    cached = JSON.parse(readFileSync(process.env.PRERENDER_FIXTURE, "utf8"));
  }
  if (!cached) {
    const direct = String(url).replace(".apicdn.sanity.io", ".api.sanity.io");
    const res = await fetch(direct, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error("Sanity a répondu " + res.status + " pour " + direct);
    cached = await res.json();
  }
  return { ok: true, json: async () => cached };
}

/** Rejoue le moteur du site sur une page, dans un DOM simulé. */
async function render(page) {
  const html = readFileSync(join(SITE, page), "utf8");
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://maison-alliani.com/" + page,
    pretendToBeVisual: true
  });
  const { window } = dom;

  /* Le français est la langue de référence : les pages sont écrites ainsi. */
  window.MA_LANG = "fr";
  window.fetch = fetchOnce;

  for (const file of ENGINE) {
    window.eval(readFileSync(join(SITE, file), "utf8"));
  }

  if (!window.cmsReady) throw new Error(page + " : le moteur ne s'est pas initialisé");
  await window.cmsReady;

  const out = "<!DOCTYPE html>\n" + window.document.documentElement.outerHTML + "\n";
  window.close();
  return out;
}

/** Sitemap daté du jour du calcul, plutôt qu'une date figée dans le fichier. */
function writeSitemap(dir, day) {
  const PRIORITY = {
    "index.html": "1.0",
    "savoir-faire.html": "0.8",
    "galerie.html": "0.8",
    "processus.html": "0.7",
    "contact.html": "0.7"
  };
  const urls = Object.entries(PRIORITY)
    .map(([page, priority]) => {
      /* Les pages s'annoncent sans extension, comme elles sont servies. */
      const loc = page === "index.html" ? "" : page.replace(/\.html$/, "");
      return `  <url>\n    <loc>https://maison-alliani.com/${loc}</loc>\n` +
        `    <lastmod>${day}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");
  writeFileSync(
    join(dir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8"
  );
}

/**
 * Compte les photos restées sur le fichier écrit dans la page.
 * Une photo servie par le CMS porte toujours ses paramètres de recadrage.
 */
function unresolved(html) {
  const dom = new JSDOM(html);
  let n = 0;
  dom.window.document.querySelectorAll("[data-cms-img]").forEach((el) => {
    if (!(el.getAttribute("src") || "").includes("?auto=format")) n++;
  });
  dom.window.close();
  return n;
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const entry of STATIC) {
  const from = join(SITE, entry);
  if (existsSync(from)) cpSync(from, join(OUT, entry), { recursive: true });
}

let photos = 0;
for (const page of PAGES) {
  const html = await render(page);
  writeFileSync(join(OUT, page), html, "utf8");
  const manquantes = unresolved(html);
  photos += manquantes;
  console.log(`  ${page.padEnd(20)} ${(html.length / 1024).toFixed(0)} Ko` +
    (manquantes ? `  — ${manquantes} photo(s) encore sur le fichier local` : ""));
}

writeSitemap(OUT, new Date().toISOString().slice(0, 10));

console.log(`\nPages écrites dans ${OUT}`);
if (photos) {
  console.log(`${photos} photo(s) ne viennent pas du CMS : elles n'ont pas été renseignées dans le Studio.`);
}
