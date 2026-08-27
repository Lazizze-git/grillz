/**
 * Contenu du site piloté depuis Sanity.
 * Le HTML des pages sert de version de secours : tant que la réponse n'est pas
 * arrivée — ou si le CMS est injoignable — le site s'affiche tel qu'il est écrit.
 * L'hydratation a lieu avant l'initialisation des modules (voir main.js), donc
 * aucun composant n'a besoin d'être relancé.
 *
 * L'essentiel du travail est déclaratif : les pages portent des attributs
 * `data-cms` que cmsBind() résout (voir js/cms-client.js). Seules les parties
 * qui construisent des éléments (catalogue, galerie) restent écrites ici.
 */

/* Projection commune des photos : adresse, description et point de recadrage. */
const CMS_IMG = '{alt, altEn, hotspot, "url": asset->url}';

const CMS_QUERY = `{
  "settings": *[_type == "siteSettings"][0],
  "home": *[_type == "homePage"][0]{
    ...,
    heroImage${CMS_IMG},
    atelierImage${CMS_IMG},
    interlude{..., image${CMS_IMG}}
  },
  "craft": *[_type == "craftPage"][0]{
    ...,
    headImage${CMS_IMG},
    portraitImage${CMS_IMG},
    todayImage${CMS_IMG},
    interlude{..., image${CMS_IMG}},
    materials[]{..., image${CMS_IMG}}
  },
  "process": *[_type == "processPage"][0]{
    ...,
    steps[]{..., image${CMS_IMG}}
  },
  "gallery": *[_type == "galleryPage"][0],
  "contact": *[_type == "contactPage"][0],
  "pieces": *[_type == "piece" && count(images) > 0] | order(order asc, name asc){
    name, ref, tag, tagEn, material, materialEn, teeth, teethEn,
    duration, durationEn, style, styleEn, categories, featured,
    images[]{alt, altEn, label, labelEn, hotspot, "url": asset->url}
  }
}`;

/** Les pages du site, désignées par <body data-page>. */
const CMS_PAGES = ["home", "craft", "process", "gallery", "contact"];

const cmsPad = (n) => String(n).padStart(2, "0");

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

/** Le nombre de modèles annoncé suit le nombre réel de créations publiées. */
function cmsRetagCount(el, count) {
  if (!el || !count) return;
  const text = el.textContent;
  if (!/\d/.test(text)) return;
  el.textContent = text.replace(/\d+/, cmsPad(count));
}

/** Accueil : grande photo, repères et catalogue. Le reste passe par data-cms. */
function cmsHydrateHome(home, pieces) {
  if (home) {
    const caption = cmsPick(home.heroCaption, home.heroCaptionEn);
    if (caption) {
      cmsFillSlashed(
        document.querySelector(".hero__visual-ref"),
        caption.split("//").map((s) => s.trim()).filter(Boolean)
      );
    }
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

  cmsRetagCount(document.querySelector(".catalog__bar span"), shown.length);
  cmsRetagCount(document.querySelector(".catalog__bar--foot .link"), shown.length);
}

/** Coordonnées et statut, présents dans le menu et le pied de page. */
function cmsHydrateSettings(data) {
  const settings = data && data.settings;
  if (!settings) return;

  if (settings.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      /* Le lien « réserver un appel » porte un sujet : on ne garde que celui-ci. */
      const subject = a.getAttribute("href").split("?")[1];
      a.href = "mailto:" + settings.email + (subject ? "?" + subject : "");
      if (!subject) cmsText(a, settings.email);
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
      const note = el.dataset.cmsNote ? cmsGet(data, el.dataset.cmsNote) : null;
      const parts = [
        document.createTextNode(settings.addressLine1),
        document.createElement("br"),
        document.createTextNode(settings.addressLine2)
      ];
      if (cmsFilled(note)) {
        parts.push(document.createElement("br"), document.createTextNode(String(note)));
      }
      el.replaceChildren.apply(el, parts);
    });
  }

  const label = cmsPick(settings.bookingLabel, settings.bookingLabelEn);
  const detail = cmsPick(settings.bookingDetail, settings.bookingDetailEn);
  const closed = settings.bookingOpen === false;

  document.querySelectorAll(".footer__state, .hero__status").forEach((el) => {
    /* La pastille cesse de clignoter quand le carnet est annoncé fermé. */
    el.classList.toggle("is-closed", closed);

    const last = el.lastChild;
    if (!last || last.nodeType !== 3 || !label) return;
    /* Seuls les emplacements qui portent déjà une précision la conservent :
       « Carnet ouvert · sur rendez-vous » en haut, « Carnet ouvert » en pied. */
    const written = last.nodeValue.split("·")[1];
    if (!written) {
      last.nodeValue = label;
      return;
    }
    last.nodeValue = label + (cmsFilled(detail) ? " · " + detail : " ·" + written);
  });
}

/** Titre de l'onglet et description lue par Google. */
function cmsHydrateSeo(data) {
  const page = document.body.dataset.page;
  const seo = CMS_PAGES.indexOf(page) > -1 ? cmsGet(data[page], "seo") : null;
  if (!seo) return;

  const title = cmsGet(seo, "title");
  if (cmsFilled(title)) document.title = title;

  const description = cmsGet(seo, "description");
  if (!cmsFilled(description)) return;
  document
    .querySelectorAll(
      'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]'
    )
    .forEach((meta) => meta.setAttribute("content", description));
}

/**
 * Le curseur du budget peut avoir changé de bornes : on prévient le
 * formulaire pour qu'il réaffiche le montant.
 */
function cmsRefreshRange() {
  document.querySelectorAll('input[type="range"]').forEach((el) => {
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/**
 * Pose un contenu sur la page. Rejouable autant de fois que voulu : chaque
 * appel repart des mêmes gabarits, ce qui permet à l'aperçu de l'espace
 * d'édition de rafraîchir la page à chaque frappe.
 */
function cmsApplyAll(data) {
  if (!data) return;
  cmsBind(data);
  cmsHydrateSeo(data);
  cmsHydrateSettings(data);
  cmsRefreshRange();
  cmsHydrateHome(data.home, data.pieces);
  if (typeof window.cmsHydrateGallery === "function") window.cmsHydrateGallery(data.pieces);
  if (typeof window.cmsHydrateCraft === "function") window.cmsHydrateCraft(data.craft);
}

/* Repris par le module d'aperçu, qui rejoue la même requête et la même pose. */
window.CMS_QUERY = CMS_QUERY;
window.cmsApplyAll = cmsApplyAll;

/* Une seule requête pour toute la page ; les erreurs restent silencieuses
   pour ne jamais casser l'affichage. */
window.cmsReady = cmsQuery(CMS_QUERY)
  .then(cmsApplyAll)
  .catch(() => {
    /* CMS injoignable : le contenu écrit dans les pages reste affiché. */
  });

/*
 * Aperçu dans l'espace d'édition : le module n'est chargé que si la page est
 * affichée dans un cadre, ce qui n'arrive jamais chez un visiteur. Il pèse
 * plusieurs centaines de kilo-octets et n'a rien à faire en production.
 */
if (window.top !== window.self) {
  const script = document.createElement("script");
  script.src = "js/preview.bundle.js";
  script.defer = true;
  document.head.appendChild(script);
}
