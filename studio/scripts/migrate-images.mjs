/**
 * Report des anciennes « Créations » dans les pages qui les affichaient.
 *
 * Jusqu'ici, une même création alimentait à la fois le catalogue de l'accueil
 * et la galerie : changer sa photo la changeait aux deux endroits. Désormais
 * chaque page porte ses propres photos. Ce script recopie l'existant à sa
 * nouvelle place, une fois, pour que rien ne soit perdu ni à refaire :
 *
 *   - la 1re photo de chaque création cochée « catalogue » → une carte de l'accueil
 *   - chaque photo de chaque création                      → une vue de la galerie
 *
 * Les photos ne sont pas retéléversées : seules leurs références sont copiées.
 * Les créations d'origine ne sont pas supprimées — elles restent dans le
 * contenu, simplement plus affichées nulle part.
 *
 *   SANITY_AUTH_TOKEN=… node scripts/migrate-images.mjs [--force] [--dry-run]
 *
 * Sans --force, une page qui contient déjà ses photos n'est pas touchée.
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const token = process.env.SANITY_AUTH_TOKEN;
if (!token) {
  console.error("Le jeton SANITY_AUTH_TOKEN est absent.");
  process.exit(1);
}

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId: "eh6tu5mk",
  dataset: "production",
  apiVersion: "2024-06-01",
  token,
  useCdn: false
});

/** Une photo recopiée telle quelle : même fichier, même cadrage, même description. */
const photo = (image) => ({
  _type: "image",
  asset: image.asset,
  ...(image.hotspot ? { hotspot: image.hotspot } : {}),
  ...(image.crop ? { crop: image.crop } : {}),
  ...(image.alt ? { alt: image.alt } : {}),
  ...(image.altEn ? { altEn: image.altEn } : {})
});

/** Ne recopie que ce qui est renseigné : une clé vide vaut mieux qu'une clé vide écrite. */
const filled = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));

/** Les vues supplémentaires d'une même pièce gardaient ce suffixe : MA-02, MA-02·B. */
const viewRef = (ref, i) => (!ref ? "" : i === 0 ? ref : ref + "·" + String.fromCharCode(65 + i));

const viewName = (piece, image, i) =>
  i === 0 || !image.label ? piece.name : piece.name + " · " + image.label;

const pieces = await client.fetch(
  `*[_type == "piece" && count(images) > 0] | order(order asc, name asc)`
);

if (!pieces.length) {
  console.log("Aucune création à reprendre.");
  process.exit(0);
}

const cards = pieces
  .filter((p) => p.featured !== false)
  .map((p) =>
    filled({
      _type: "catalogCard",
      _key: randomUUID().slice(0, 12),
      image: photo(p.images[0]),
      name: p.name,
      ref: p.ref,
      material: p.material,
      materialEn: p.materialEn,
      duration: p.duration,
      durationEn: p.durationEn
    })
  );

const tiles = pieces.flatMap((p) =>
  p.images.map((image, i) =>
    filled({
      _type: "galleryTile",
      _key: randomUUID().slice(0, 12),
      image: photo(image),
      name: viewName(p, image, i),
      ref: viewRef(p.ref, i),
      tag: p.tag,
      tagEn: p.tagEn,
      categories: p.categories,
      material: p.material,
      materialEn: p.materialEn,
      teeth: p.teeth,
      teethEn: p.teethEn,
      duration: p.duration,
      durationEn: p.durationEn,
      style: p.style,
      styleEn: p.styleEn
    })
  )
);

console.log(`${pieces.length} créations lues → ${cards.length} cartes d'accueil, ${tiles.length} vues de galerie.`);

/** Écrit la page, en épargnant un contenu déjà saisi à la main. */
async function poser(id, champ, valeur, libelle) {
  const actuel = await client.fetch(`*[_id == $id][0]{ "n": count(${champ}) }`, { id });
  const dejaLa = (actuel && actuel.n) || 0;

  if (dejaLa && !force) {
    console.log(`  ${libelle} : ${dejaLa} déjà en place, laissée intacte (--force pour remplacer).`);
    return;
  }
  if (dryRun) {
    console.log(`  ${libelle} : ${valeur.length} entrées seraient écrites.`);
    return;
  }
  await client.patch(id).set({ [champ]: valeur }).commit();
  console.log(`  ${libelle} : ${valeur.length} entrées écrites.`);
}

await poser("homePage", "catalogCards", cards, "Page d'accueil");
await poser("galleryPage", "tiles", tiles, "Page Galerie");

console.log(
  dryRun
    ? "Essai à blanc : rien n'a été modifié."
    : "Reprise terminée. Les créations d'origine restent dans le contenu, sans être affichées."
);
