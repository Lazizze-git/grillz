/**
 * Assemble le module d'aperçu en un seul fichier chargeable par le site.
 *
 *   node scripts/build-preview.mjs [fichier-de-sortie]
 *
 * Le site n'a pas d'étape de compilation : ce module est le seul morceau
 * assemblé, et il n'est chargé que dans l'espace d'édition.
 */
import { build } from "esbuild";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { statSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "../..");
const out = resolve(process.argv[2] || join(SITE, "js/preview.bundle.js"));

const STUDIO_URL = process.env.STUDIO_URL || "https://maisonalliani.sanity.studio";

await build({
  entryPoints: [join(here, "../preview/entry.js")],
  outfile: out,
  bundle: true,
  format: "iife",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  define: { "window.SANITY_STUDIO_URL": JSON.stringify(STUDIO_URL) }
});

console.log(`Module d'aperçu : ${out} (${(statSync(out).size / 1024).toFixed(0)} Ko)`);
