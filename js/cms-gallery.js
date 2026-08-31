/**
 * Reconstruction de la galerie et de la page Savoir-faire à partir de Sanity.
 * Chaque vue de la page Galerie devient une tuile ; la fiche détaillée est
 * ensuite gérée par gallery.js, qui lit les attributs data-*.
 */

/** Une tuile de la grille, avec les caractéristiques lues par la fiche détaillée. */
function cmsBuildTile(tile) {
  const el = cmsEl("article", "tile");
  el.dataset.cat = (tile.categories || []).join(" ");
  el.dataset.ref = tile.ref || "";
  el.dataset.name = tile.name || "";
  const specs = {
    material: cmsPick(tile.material, tile.materialEn),
    teeth: cmsPick(tile.teeth, tile.teethEn),
    duree: cmsPick(tile.duration, tile.durationEn),
    style: cmsPick(tile.style, tile.styleEn)
  };
  Object.keys(specs).forEach((key) => {
    if (specs[key]) el.dataset[key] = specs[key];
  });

  const media = cmsEl("div", "tile__media");
  media.appendChild(cmsEl("span", "tile__ref", el.dataset.ref));
  const img = cmsEl("img");
  img.loading = "lazy";
  cmsSetImage(img, tile.image, { w: 900, h: 1125 });
  media.appendChild(img);

  const foot = cmsEl("div", "tile__foot");
  foot.appendChild(cmsEl("span", "tile__name", el.dataset.name));
  const tag = cmsPick(tile.tag, tile.tagEn);
  if (tag) foot.appendChild(cmsEl("span", "tile__tag", tag));

  el.appendChild(media);
  el.appendChild(foot);
  return el;
}

/** Remplace la grille par les vues écrites dans la page Galerie. */
function cmsHydrateGallery(tiles) {
  const grid = document.querySelector(".grid-gallery");
  if (!grid || !tiles || !tiles.length) return;

  const nodes = tiles.filter((tile) => tile && tile.image).map(cmsBuildTile);
  if (!nodes.length) return;

  grid.replaceChildren.apply(grid, nodes);
}

/**
 * Page Savoir-faire : les quatre paragraphes du portrait sont répartis à
 * quatre endroits distincts de la page, dans l'ordre où ils sont écrits.
 * Le reste de la page passe par les attributs data-cms.
 */
function cmsHydrateCraft(craft) {
  if (!craft) return;

  const paragraphs = cmsPick(craft.portraitParagraphs, craft.portraitParagraphsEn);
  if (Array.isArray(paragraphs)) {
    paragraphs.forEach((text, i) => {
      cmsText(document.querySelector('[data-craft-p="' + (i + 1) + '"]'), text);
    });
  }

  /* Les guillemets encadrent la citation : ils ne sont pas saisis dans le CMS. */
  const quote = cmsPick(craft.portraitQuote, craft.portraitQuoteEn);
  const quoteEl = document.querySelector("[data-craft-quote]");
  if (quoteEl && quote && quote.trim()) {
    quoteEl.textContent = "« " + quote.trim().replace(/^[«"]\s*|\s*[»"]$/g, "") + " »";
  }
}
