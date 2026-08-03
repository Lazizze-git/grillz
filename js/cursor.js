/**
 * Curseur custom — flèche chromée.
 * La flèche colle au pointeur (aucun lag : la pointe reste précise), s'incline
 * légèrement selon la vitesse et voit ses reflets glisser sur le métal ; un
 * halo suit avec de l'inertie derrière elle.
 * Positionné en transform (composité GPU, aucun re-layout) et piloté par
 * délégation d'événements : les éléments ajoutés dynamiquement (panneaux
 * de galerie, récapitulatif…) sont couverts sans ré-initialisation.
 * Désactivé sur tactile / pointeur grossier.
 */

/* Flèche façon curseur système, dessinée dans un viewBox de 28 × 38.
   La pointe est en (3 ; 2.4) : c'est le point chaud, recalé en CSS. */
const CURSOR_ARROW_PATH =
  "M3 2.4 L3 30.6 L10.4 23.6 L14.9 33.8 L19.7 31.6 L15.2 21.7 L23.8 21.7 Z";

/* Bandes claires/sombres alternées : c'est ce contraste qui fait le chrome. */
const CURSOR_SVG = `
<svg width="32" height="43" viewBox="0 0 28 38" fill="none" focusable="false" aria-hidden="true">
  <defs>
    <linearGradient id="ma-chrome" x1="0" y1="0" x2="0.4" y2="1" gradientTransform="rotate(0 .5 .5)">
      <stop offset="0" stop-color="#ffffff" />
      <stop offset="0.16" stop-color="#c8d1de" />
      <stop offset="0.31" stop-color="#5d6675" />
      <stop offset="0.46" stop-color="#f4f7fb" />
      <stop offset="0.58" stop-color="#a7b1c0" />
      <stop offset="0.73" stop-color="#3a4250" />
      <stop offset="0.87" stop-color="#dde4ee" />
      <stop offset="1" stop-color="#8b94a4" />
    </linearGradient>
    <linearGradient id="ma-chrome-edge" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.15" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.7" />
    </linearGradient>
  </defs>
  <path d="${CURSOR_ARROW_PATH}" fill="url(#ma-chrome)" stroke="#15181f"
        stroke-width="2.4" stroke-linejoin="round" paint-order="stroke fill" />
  <path d="${CURSOR_ARROW_PATH}" fill="none" stroke="url(#ma-chrome-edge)"
        stroke-width="0.9" stroke-linejoin="round" />
</svg>`;

function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;

  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const arrow = document.createElement("span");
  arrow.className = "cursor__arrow";
  arrow.innerHTML = CURSOR_SVG;
  cursor.replaceChildren(arrow);

  const chrome = arrow.querySelector("#ma-chrome");
  document.body.classList.add("has-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX;
  let y = mouseY;
  let lastX = mouseX;
  let tilt = 0;
  let shine = 0;

  const place = (el, px, py, extra) => {
    el.style.transform = `translate(${px}px, ${py}px)${extra || ""}`;
  };
  place(arrow, mouseX, mouseY); /* position initiale : centre de l'écran */

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = "1"; /* apparaît là où la souris se trouve vraiment */
      if (calm) place(arrow, mouseX, mouseY);
    },
    { passive: true }
  );

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  if (!calm) {
    (function render() {
      /* Glissement : la flèche rattrape le pointeur au lieu d'y être collée.
         0.28 = assez rapide pour rester précis, assez lent pour être fluide. */
      x += (mouseX - x) * 0.28;
      y += (mouseY - y) * 0.28;

      /* Inclinaison : la flèche se couche un peu dans le sens du déplacement. */
      const speedX = mouseX - lastX;
      lastX = mouseX;
      tilt += (clamp(speedX * 0.4, -7, 7) - tilt) * 0.1;
      place(arrow, x, y, ` rotate(${tilt.toFixed(2)}deg)`);

      /* Les reflets glissent à contresens : le métal accroche la lumière. */
      shine += (tilt * -4 - shine) * 0.08;
      chrome.setAttribute("gradientTransform", `rotate(${shine.toFixed(2)} .5 .5)`);

      requestAnimationFrame(render);
    })();
  }

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

  document.addEventListener("mousedown", () => cursor.classList.add("cursor--press"), {
    passive: true
  });
  document.addEventListener("mouseup", () => cursor.classList.remove("cursor--press"), {
    passive: true
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}
