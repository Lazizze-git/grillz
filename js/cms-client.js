/**
 * Accès au contenu Sanity — lecture seule, sans clé secrète.
 * Le dataset « production » est public : seul le contenu publié sort d'ici,
 * et aucun jeton n'est exposé côté navigateur.
 */
const CMS = {
  projectId: "eh6tu5mk",
  dataset: "production",
  apiVersion: "v2024-06-01",
  timeoutMs: 3000
};

/* Lue par le module d'aperçu, qui interroge le même projet. */
window.CMS_CONFIG = CMS;

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
  /* Les dimensions demandées réservent la place avant l'arrivée de la photo :
     la page cesse de sauter pendant le chargement. La mise en page reste
     gouvernée par le CSS, ces attributs ne servent que de proportions. */
  if (opts && opts.w) el.setAttribute("width", String(opts.w));
  if (opts && opts.h) el.setAttribute("height", String(opts.h));
  const alt = cmsPick(image.alt, image.altEn);
  if (alt) el.alt = alt;
}

/* ------------------------------------------------------------------------ *
 *  Moteur de liaison HTML ↔ contenu
 *
 *  Les pages portent des attributs `data-cms` qui désignent un champ du CMS
 *  par son chemin (« protocolHead.title »). Le texte écrit dans la page reste
 *  la version de secours : rien n'est remplacé tant qu'une valeur n'arrive pas.
 *
 *    data-cms="chemin"          le texte de l'élément
 *    data-cms-lead="chemin"     le début du texte, en gardant les enfants
 *    data-cms-img="chemin"      la photo, avec data-cms-w / data-cms-h
 *    data-cms-attr="href:chemin" un attribut, plusieurs séparés par une virgule
 *    data-cms-repeat="chemin"   répète le premier enfant pour chaque entrée
 *    data-cms-num=" //"         numérote l'entrée courante : « 01// »
 * ------------------------------------------------------------------------ */

/** Deux chiffres, comme les repères du site : 1 → « 01 ». */
function cmsPad2(n) {
  return String(n).padStart(2, "0");
}

/** Vrai si la valeur mérite d'écraser ce qui est écrit dans la page. */
function cmsFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Lit un champ en préférant la traduction anglaise quand elle existe.
 * Les indices de tableau (« steps.0.title ») sont acceptés tels quels.
 */
function cmsField(obj, key) {
  if (obj === null || typeof obj !== "object") return undefined;
  if (/^\d+$/.test(key)) return obj[Number(key)];
  if (cmsLang() === "en" && cmsFilled(obj[key + "En"])) return obj[key + "En"];
  return obj[key];
}

/**
 * Suit un chemin pointé dans le contenu : « pathways.0.specs ».
 * Plusieurs chemins séparés par « | » : le premier renseigné l'emporte.
 */
function cmsGet(root, path) {
  if (!root || !path) return undefined;
  if (path.indexOf("|") > -1) {
    const found = path.split("|").map((p) => cmsGet(root, p.trim())).find(cmsFilled);
    return found;
  }
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined) return undefined;
    cur = cmsField(cur, parts[i]);
  }
  return cur;
}

/**
 * Remplace le début du texte sans toucher aux éléments enfants.
 * Sert aux titres en deux teintes : « Quatre gestes. <span>…</span> ».
 */
function cmsLeadText(el, value) {
  if (!el || !cmsFilled(value)) return;
  const nodes = el.childNodes;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType === 3 && nodes[i].nodeValue.trim()) {
      nodes[i].nodeValue = value + " ";
      return;
    }
  }
  el.insertBefore(document.createTextNode(value + " "), el.firstChild);
}

/** Un clone n'a pas encore été révélé : il repart de zéro à l'apparition. */
function cmsResetReveal(node) {
  const all = [node].concat(Array.prototype.slice.call(node.querySelectorAll("*")));
  all.forEach((el) => {
    if (!el.hasAttribute) return;
    el.removeAttribute("data-revealed");
    el.classList.remove("is-visible");
    if (el.style) el.style.transitionDelay = "";
  });
}

/** Applique les attributs de liaison portés par un élément. */
function cmsApply(el, data, index) {
  const text = el.getAttribute("data-cms");
  if (text) cmsText(el, cmsGet(data, text));

  const lead = el.getAttribute("data-cms-lead");
  if (lead) cmsLeadText(el, cmsGet(data, lead));

  const img = el.getAttribute("data-cms-img");
  if (img) {
    cmsSetImage(el, cmsGet(data, img), {
      w: Number(el.getAttribute("data-cms-w")) || undefined,
      h: Number(el.getAttribute("data-cms-h")) || undefined
    });
  }

  const attrs = el.getAttribute("data-cms-attr");
  if (attrs) {
    attrs.split(",").forEach((pair) => {
      const cut = pair.indexOf(":");
      if (cut < 1) return;
      const name = pair.slice(0, cut).trim();
      const value = cmsGet(data, pair.slice(cut + 1).trim());
      if (name && cmsFilled(value)) el.setAttribute(name, String(value));
    });
  }

  const num = el.getAttribute("data-cms-num");
  if (num !== null && typeof index === "number") {
    el.textContent = cmsPad2(index + 1) + num;
  }
}

/**
 * Répète le premier enfant du conteneur pour chaque entrée de la liste.
 * Ce premier enfant sert de gabarit : il reste dans la page comme secours
 * tant que le CMS ne répond pas.
 */
function cmsRepeat(container, data) {
  const items = cmsGet(data, container.getAttribute("data-cms-repeat"));
  if (!Array.isArray(items) || !items.length) return;

  const template = container.firstElementChild;
  if (!template) return;

  /* Cascade d'apparition : le site échelonne les enfants par groupes de N. */
  const stride = Number(container.getAttribute("data-cms-delay")) || 0;

  const nodes = items.map((item, i) => {
    const clone = template.cloneNode(true);
    cmsResetReveal(clone);
    if (stride) {
      const delay = i % stride;
      if (delay) clone.setAttribute("data-delay", String(delay));
      else clone.removeAttribute("data-delay");
    }
    cmsWalk(clone, item, i);
    return clone;
  });

  container.replaceChildren.apply(container, nodes);
}

/** Parcourt un sous-arbre et applique les liaisons rencontrées. */
function cmsWalk(el, data, index) {
  cmsApply(el, data, index);
  if (el.hasAttribute("data-cms-repeat")) {
    cmsRepeat(el, data);
    return; /* le contenu répété a déjà été lié */
  }
  let child = el.firstElementChild;
  while (child) {
    const next = child.nextElementSibling;
    cmsWalk(child, data, index);
    child = next;
  }
}

/** Point d'entrée : lie toute la page au contenu reçu. */
function cmsBind(data) {
  if (!data) return;
  cmsWalk(document.body, data);
}
