/**
 * Contenu du site piloté depuis Sanity.
 * Le HTML des pages sert de version de secours : tant que la réponse n'est pas
 * arrivée — ou si le CMS est injoignable — le site s'affiche tel qu'il est écrit.
 * L'hydratation a lieu avant l'initialisation des modules (voir main.js), donc
 * aucun composant n'a besoin d'être relancé.
 */
const CMS_QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    email, phone, phoneLink, addressLine1, addressLine2, instagram,
    bookingOpen, bookingLabel, bookingLabelEn
  },
  "home": *[_type == "homePage"][0]{
    heroCaption, heroCaptionEn, heroTitleTop, heroTitleTopEn,
    heroTitleBottom, heroTitleBottomEn, heroSub, heroSubEn, metrics, metricsEn,
    heroImage{alt, altEn, hotspot, "url": asset->url}
  },
  "craft": *[_type == "craftPage"][0]{
    portraitCaption, portraitCaptionEn, portraitParagraphs, portraitParagraphsEn,
    portraitQuote, portraitQuoteEn, portraitQuoteAuthor, portraitQuoteAuthorEn,
    headImage{alt, altEn, hotspot, "url": asset->url},
    portraitImage{alt, altEn, hotspot, "url": asset->url}
  },
  "pieces": *[_type == "piece" && count(images) > 0] | order(order asc, name asc){
    name, ref, tag, tagEn, material, materialEn, teeth, teethEn,
    duration, durationEn, style, styleEn, categories, featured,
    images[]{alt, altEn, label, labelEn, hotspot, "url": asset->url}
  }
}`;

const cmsPad = (n) => String(n).padStart(2, "0");

/** Titre en deux temps : « Façonné pour » + « une seule bouche. » en italique. */
function cmsHydrateHeroTitle(home) {
  const holder = document.querySelector(".hero__title span");
  if (!holder) return;
  const top = cmsPick(home.heroTitleTop, home.heroTitleTopEn);
  const bottom = cmsPick(home.heroTitleBottom, home.heroTitleBottomEn);
  if (!top && !bottom) return;
  const em = holder.querySelector("em");
  if (top && holder.firstChild && holder.firstChild.nodeType === 3) {
    holder.firstChild.nodeValue = top + " ";
  }
  cmsText(em, bottom);
}

/** Suites de mots séparées par le double slash de la charte : Porté // Atelier. */
function cmsFillSlashed(el, parts) {
  if (!el || !parts.length) return;
  el.replaceChildren();
  parts.forEach((part, i) => {
    if (i > 0) el.appendChild(cmsEl("i", null, "//"));
    el.appendChild(document.createTextNode(i > 0 ? " " + part + " " : part + " "));
  });
}

/** Une carte du catalogue de l'accueil. */
function cmsBuildCard(piece, index, total) {
  const card = cmsEl("article", "cat-card reveal");
  if (index % 3) card.dataset.delay = String(index % 3);

  const head = cmsEl("div", "cat-card__head");
  head.appendChild(cmsEl("span", "cat-card__ref", piece.ref));
  head.appendChild(cmsEl("span", null, cmsPad(index + 1) + "/" + cmsPad(total)));
  card.appendChild(head);

  const media = cmsEl("div", "cat-card__media");
  const img = cmsEl("img");
  img.loading = "lazy";
  cmsSetImage(img, piece.images[0], { w: 900, h: 1125 });
  media.appendChild(img);
  card.appendChild(media);

  card.appendChild(cmsEl("h3", "cat-card__name", piece.name));

  const spec = cmsEl("div", "cat-card__spec");
  [
    ["Matière", cmsPick(piece.material, piece.materialEn)],
    ["Délai", cmsPick(piece.duration, piece.durationEn)],
    ["Prix", "Sur devis"]
  ].forEach(([label, value]) => {
    if (!value) return;
    const line = cmsEl("span", null, label);
    line.appendChild(cmsEl("b", null, value));
    spec.appendChild(line);
  });
  card.appendChild(spec);

  const link = cmsEl("a", "cat-card__link", "Inspecter ");
  link.href = "galerie.html";
  link.appendChild(cmsEl("span", "arrow", "→"));
  card.appendChild(link);
  return card;
}

/** Accueil : grande photo, titres, repères et catalogue. */
function cmsHydrateHome(home, pieces) {
  if (home) {
    cmsSetImage(document.querySelector(".hero__visual img"), home.heroImage, {
      w: 1200,
      h: 1600
    });
    const caption = cmsPick(home.heroCaption, home.heroCaptionEn);
    if (caption) {
      cmsFillSlashed(
        document.querySelector(".hero__visual-ref"),
        caption.split("//").map((s) => s.trim()).filter(Boolean)
      );
    }
    cmsHydrateHeroTitle(home);
    cmsText(document.querySelector(".hero__sub"), cmsPick(home.heroSub, home.heroSubEn));
    const metrics = cmsPick(home.metrics, home.metricsEn);
    if (Array.isArray(metrics)) {
      cmsFillSlashed(document.querySelector(".hero__metrics"), metrics.filter(Boolean));
    }
  }

  const catalog = document.querySelector(".catalog");
  if (!catalog || !pieces || !pieces.length) return;
  const shown = pieces.filter((p) => p.featured !== false);
  if (!shown.length) return;
  catalog.replaceChildren.apply(
    catalog,
    shown.map((piece, i) => cmsBuildCard(piece, i, shown.length))
  );

  const bar = document.querySelector(".catalog__bar span");
  cmsText(bar, cmsPad(shown.length) + " modèles référencés");
}

/** Coordonnées et statut, présents dans le menu et le pied de page. */
function cmsHydrateSettings(settings) {
  if (!settings) return;

  if (settings.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = "mailto:" + settings.email;
      cmsText(a, settings.email);
    });
  }
  if (settings.phoneLink || settings.phone) {
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      if (settings.phoneLink) a.href = "tel:" + settings.phoneLink.replace(/\s/g, "");
      cmsText(a, settings.phone);
    });
  }
  if (settings.instagram) {
    document.querySelectorAll('a[href*="instagram.com"]').forEach((a) => {
      a.href = settings.instagram;
    });
  }
  if (settings.addressLine1 && settings.addressLine2) {
    document.querySelectorAll("address").forEach((el) => {
      el.replaceChildren(
        document.createTextNode(settings.addressLine1),
        document.createElement("br"),
        document.createTextNode(settings.addressLine2)
      );
    });
  }

  const label = cmsPick(settings.bookingLabel, settings.bookingLabelEn);
  if (!label) return;
  document.querySelectorAll(".footer__state, .hero__status").forEach((el) => {
    const last = el.lastChild;
    if (!last || last.nodeType !== 3) return;
    /* « Carnet ouvert · sur rendez-vous » : la précision du site est conservée. */
    const detail = last.nodeValue.split("·")[1];
    last.nodeValue = detail ? label + " ·" + detail : label;
  });
}

/* Une seule requête pour toute la page ; les erreurs restent silencieuses
   pour ne jamais casser l'affichage. */
window.cmsReady = cmsQuery(CMS_QUERY)
  .then((data) => {
    if (!data) return;
    cmsHydrateSettings(data.settings);
    cmsHydrateHome(data.home, data.pieces);
    if (typeof window.cmsHydrateGallery === "function") window.cmsHydrateGallery(data.pieces);
    if (typeof window.cmsHydrateCraft === "function") window.cmsHydrateCraft(data.craft);
  })
  .catch(() => {
    /* CMS injoignable : le contenu écrit dans les pages reste affiché. */
  });
