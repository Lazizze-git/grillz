/**
 * Applique les textes de référencement au projet en ligne.
 *
 * Le contenu de départ ne sert qu'à une première installation : un projet
 * déjà rempli garde ses anciens titres, et le site les reprendrait par-dessus
 * ceux écrits dans les pages. Ce correctif ne touche qu'au bloc « seo » des
 * cinq pages — le reste du contenu, y compris le travail du client, est
 * laissé intact.
 *
 *   SANITY_AUTH_TOKEN=... node scripts/patch-seo.mjs [--dry]
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO } from "./seo-defaults.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const cli = readFileSync(join(here, "../sanity.cli.ts"), "utf8");
const read = (key) => (cli.match(new RegExp(key + ':\\s*"([^"]+)"')) || [])[1];

const projectId = read("projectId");
const dataset = read("dataset");
const token = process.env.SANITY_AUTH_TOKEN;
const dry = process.argv.includes("--dry");

if (!projectId || !dataset) throw new Error("projet ou dataset introuvable dans sanity.cli.ts");
if (!token && !dry) throw new Error("SANITY_AUTH_TOKEN manquant");

const client = createClient({ projectId, dataset, apiVersion: "2024-06-01", token, useCdn: false });

/* Le brouillon éventuel est corrigé lui aussi : sans quoi il réintroduirait
   l'ancien texte à la prochaine publication. */
const ids = Object.keys(SEO).flatMap((id) => [id, `drafts.${id}`]);
const existing = await client.fetch("*[_id in $ids]{_id}", { ids });
const present = new Set(existing.map((d) => d._id));

console.log(`Projet ${projectId} / ${dataset}`);
if (dry) console.log("(simulation : rien n'est écrit)\n");

let touched = 0;
const tx = client.transaction();

for (const id of ids) {
  const base = id.replace(/^drafts\./, "");
  if (!present.has(id)) {
    if (!id.startsWith("drafts.")) console.log(`  ${id.padEnd(20)} absent du projet`);
    continue;
  }
  const seo = { _type: "seoBlock", ...SEO[base] };
  console.log(`  ${id.padEnd(20)} → ${seo.title}`);
  tx.patch(id, (p) => p.set({ seo }));
  touched++;
}

if (!touched) {
  console.log("\nAucun document à corriger.");
} else if (dry) {
  console.log(`\n${touched} document(s) seraient corrigés.`);
} else {
  await tx.commit();
  console.log(`\n${touched} document(s) corrigés.`);
}
