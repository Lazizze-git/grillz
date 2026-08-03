/**
 * Reconstruction de la galerie et de la page Savoir-faire à partir de Sanity.
 * Chaque photo d'une création devient une vue de la galerie ; la fiche
 * détaillée est ensuite gérée par gallery.js, qui lit les attributs data-*.
 */

/** Vues supplémentaires d'une même pièce : MA-02, puis MA-02·B, MA-02·C… */
function cmsViewRef(ref, index) {
  if (!ref) return "";
  return index === 0 ? ref : ref + "·" + String.fromCharCode(65 + index);
}

function cmsViewName(piece, image, index) {
  const label = cmsPick(image.label, image.labelEn);
  if (index === 0 || !label) return piece.name;
  return piece.name + " · " + label;
}

/** Une tuile de la grille, avec les caractéristiques lues par la fiche détaillée. */
function cmsBuildTile(piece, image, index) {
  const tile = cmsEl("article", "tile");
  tile.dataset.cat = (piece.categories || []).join(" ");
  tile.dataset.ref = cmsViewRef(piece.ref, index);
  tile.dataset.name = cmsViewName(piece, image, index);
  const specs = {
    material: cmsPick(piece.material, piece.materialEn),
    teeth: cmsPick(piece.teeth, piece.teethEn),
    duree: cmsPick(piece.duration, piece.durationEn),
    style: cmsPick(piece.style, piece.styleEn)
  };
  Object.keys(specs).forEach((key) => {
    if (specs[key]) tile.dataset[key] = specs[key];
  });

  const media = cmsEl("div", "tile__media");
  media.appendChild(cmsEl("span", "tile__ref", tile.dataset.ref));
  const img = cmsEl("img");
  img.loading = "lazy";
  cmsSetImage(img, image, { w: 900, h: 1125 });
  media.appendChild(img);

  const foot = cmsEl("div", "tile__foot");
  foot.appendChild(cmsEl("span", "tile__name", tile.dataset.name));
  const tag = cmsPick(piece.tag, piece.tagEn);
  if (tag) foot.appendChild(cmsEl("span", "tile__tag", tag));

  tile.appendChild(media);
  tile.appendChild(foot);
  return tile;
}

/** Remplace la grille de la galerie par les créations publiées. */
function cmsHydrateGallery(pieces) {
  const grid = document.querySelector(".grid-gallery");
  if (!grid || !pieces || !pieces.length) return;

  const tiles = [];
  pieces.forEach((piece) => {
    (piece.images || []).forEach((image, index) => {
      if (image && image.url) tiles.push(cmsBuildTile(piece, image, index));
    });
  });
  if (!tiles.length) return;

  grid.replaceChildren.apply(grid, tiles);
}

/** Page Savoir-faire : photo d'en-tête, portrait et texte de la technicienne. */
function cmsHydrateCraft(craft) {
  if (!craft) return;

  const head = document.querySelector(".page-head__visual img");
  cmsSetImage(head, craft.headImage, { w: 900, h: 1200 });

  const photo = document.querySelector(".profile__photo img");
  cmsSetImage(photo, craft.portraitImage, { w: 900, h: 1125 });
  cmsText(
    document.querySelector(".profile__photo figcaption"),
    cmsPick(craft.portraitCaption, craft.portraitCaptionEn)
  );

  /* Le texte est réparti dans la page : chaque paragraphe a son emplacement. */
  const paragraphs = cmsPick(craft.portraitParagraphs, craft.portraitParagraphsEn);
  if (Array.isArray(paragraphs)) {
    paragraphs.forEach((text, i) => {
      cmsText(document.querySelector('[data-craft-p="' + (i + 1) + '"]'), text);
    });
  }

  const quote = cmsPick(craft.portraitQuote, craft.portraitQuoteEn);
  const quoteEl = document.querySelector("[data-craft-quote]");
  if (quoteEl && quote && quote.trim()) {
    quoteEl.textContent = "« " + quote.trim().replace(/^[«"]\s*|\s*[»"]$/g, "") + " »";
  }
  cmsText(
    document.querySelector("[data-craft-author]"),
    cmsPick(craft.portraitQuoteAuthor, craft.portraitQuoteAuthorEn)
  );
}
