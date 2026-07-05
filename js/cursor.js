/**
 * Curseur custom — point + anneau avec léger lag.
 * Positionné en transform (composité GPU, aucun re-layout) et piloté par
 * délégation d'événements : les éléments ajoutés dynamiquement (panneaux
 * de galerie, récapitulatif…) sont couverts sans ré-initialisation.
 * Désactivé sur tactile / pointeur grossier.
 */
function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;

  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  if (!dot || !ring) return;

  document.body.classList.add("has-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  const place = (el, x, y) => {
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  };
  place(dot, mouseX, mouseY); /* position initiale : centre de l'écran */

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      place(dot, mouseX, mouseY);
    },
    { passive: true }
  );

  (function render() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    place(ring, ringX, ringY);
    requestAnimationFrame(render);
  })();

  const INTERACTIVE =
    "a, button, summary, .choice, .tile, .filter, .cat-card, input, textarea, label";
  document.addEventListener(
    "mouseover",
    (e) => {
      const onTarget =
        e.target instanceof Element && Boolean(e.target.closest(INTERACTIVE));
      cursor.classList.toggle("cursor--active", onTarget);
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}
