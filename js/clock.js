/**
 * Heure locale de l'atelier (fuseau de Lausanne) dans le footer.
 * Remplit les éléments [data-clock] et se met à jour toutes les 30 s.
 * Si le fuseau n'est pas disponible, le tiret du HTML reste affiché.
 * Global : window.initClock (appelé par main.js).
 */
function initClock() {
  const nodes = document.querySelectorAll("[data-clock]");
  if (!nodes.length) return;

  let format;
  try {
    format = new Intl.DateTimeFormat("fr-CH", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Zurich",
    });
  } catch (_) {
    return; /* environnement sans fuseaux horaires : on n'affiche rien */
  }

  function tick() {
    const now = format.format(new Date());
    nodes.forEach(function (node) {
      node.textContent = now;
    });
  }

  tick();
  window.setInterval(tick, 30000);
}
