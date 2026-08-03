/**
 * Reveal au scroll via IntersectionObserver.
 * - Éléments .reveal / .reveal-mask : fondu-montée à l'entrée dans le viewport.
 * - Conteneurs [data-stagger] : leurs enfants .reveal apparaissent en cascade.
 * Sans IO ou en "reduced motion" : tout est révélé immédiatement.
 * Réentrant : un second appel ne reprend que les éléments arrivés depuis
 * (contenu injecté par le CMS), les autres sont marqués comme déjà traités.
 */
function initScrollReveal() {
  const SEL = ".reveal:not([data-revealed]), .reveal-mask:not([data-revealed])";
  const all = document.querySelectorAll(SEL);
  if (!all.length) return;
  const fresh = new Set(all);
  all.forEach((el) => el.setAttribute("data-revealed", ""));

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const noIO = typeof window.IntersectionObserver === "undefined";
  const show = (el) => el.classList.add("is-visible");

  if (reduce || noIO) {
    all.forEach(show);
    return;
  }

  const vh = window.innerHeight || document.documentElement.clientHeight;
  const inFold = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < vh * 0.92 && r.bottom > 0;
  };

  /* Conteneurs à cascade : on repère leurs enfants pour ne pas les observer seuls. */
  const groups = Array.from(document.querySelectorAll("[data-stagger]"));
  const grouped = new Set();
  groups.forEach((g) => g.querySelectorAll(".reveal").forEach((c) => grouped.add(c)));

  const STEP = 70; /* ms entre deux enfants — court, jamais bloquant */
  const revealGroup = (g) => {
    g.querySelectorAll(".reveal").forEach((kid, i) => {
      kid.style.transitionDelay = i * STEP + "ms";
      show(kid);
    });
  };

  /* Observer pour les éléments isolés */
  const singleIO = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          show(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  Array.from(all).forEach((el) => {
    if (grouped.has(el)) return; /* géré par sa cascade */
    if (inFold(el)) show(el);
    else singleIO.observe(el);
  });

  /* Observer pour les conteneurs à cascade */
  const groupIO = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          revealGroup(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );

  /* Seuls les groupes contenant du contenu nouveau sont (re)traités. */
  groups.forEach((g) => {
    const hasFresh = Array.from(g.querySelectorAll(".reveal")).some((c) => fresh.has(c));
    if (!hasFresh) return;
    if (inFold(g)) revealGroup(g);
    else groupIO.observe(g);
  });
}
