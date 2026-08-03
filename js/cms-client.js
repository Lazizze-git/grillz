/**
 * Accès au contenu Sanity — lecture seule, sans clé secrète.
 * Le dataset « production » est public : seul le contenu publié sort d'ici,
 * et aucun jeton n'est exposé côté navigateur.
 */
const CMS = {
  projectId: "64jkc7yr",
  dataset: "production",
  apiVersion: "v2024-06-01",
  timeoutMs: 3000
};

/** Requête GROQ vers le CDN de Sanity (réponse mise en cache, purgée à chaque publication). */
function cmsQuery(groq) {
  const url =
    `https://${CMS.projectId}.apicdn.sanity.io/${CMS.apiVersion}` +
    `/data/query/${CMS.dataset}?query=${encodeURIComponent(groq)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CMS.timeoutMs);

  return fetch(url, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error("Sanity a répondu " + res.status);
      return res.json();
    })
    .then((body) => body.result || null)
    .finally(() => clearTimeout(timer));
}

/**
 * Construit l'adresse d'une image aux dimensions demandées.
 * Respecte le point de recadrage choisi dans le Studio.
 */
function cmsImage(image, opts) {
  if (!image || !image.url) return null;
  const o = opts || {};
  const params = ["auto=format", "q=" + (o.q || 78)];
  if (o.w) params.push("w=" + o.w);
  if (o.h) params.push("h=" + o.h);
  if (o.w && o.h) {
    params.push("fit=crop");
    if (image.hotspot) {
      params.push("crop=focalpoint");
      params.push("fp-x=" + image.hotspot.x.toFixed(3));
      params.push("fp-y=" + image.hotspot.y.toFixed(3));
    }
  }
  return image.url + "?" + params.join("&");
}

/** Langue active du site, choisie par i18n.js. */
function cmsLang() {
  return window.MA_LANG === "en" ? "en" : "fr";
}

/** Renvoie la version anglaise si elle existe, sinon le français. */
function cmsPick(fr, en) {
  if (cmsLang() === "en" && en) return en;
  return fr;
}

/** N'écrit que si le contenu existe : sinon le texte du HTML reste en place. */
function cmsText(el, value) {
  if (el && typeof value === "string" && value.trim()) el.textContent = value;
}

/** Petite fabrique d'éléments : le texte passe par textContent, jamais par HTML. */
function cmsEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

/** Remplace une image et sa description, en gardant celles du HTML en secours. */
function cmsSetImage(el, image, opts) {
  if (!el || !image) return;
  const src = cmsImage(image, opts);
  if (!src) return;
  el.src = src;
  el.removeAttribute("srcset");
  const alt = cmsPick(image.alt, image.altEn);
  if (alt) el.alt = alt;
}
