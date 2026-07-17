/**
 * Fond topographique animé — courbes de niveau très discrètes derrière le
 * contenu, comme une carte d'altitude qui dérive lentement (réf. bor.co.id).
 * Canvas 2D natif, aucune librairie ; le champ d'altitude vient de
 * topo-noise.js, les courbes de topo-contours.js, et elles sont tracées ici
 * en courbes de Bézier pour un rendu rond et fluide. Le calque est créé par
 * ce script : sans JavaScript, le site garde simplement son fond uni.
 * - « prefers-reduced-motion » : une seule image fixe, pas d'animation.
 * - Onglet masqué : rendu en pause.
 * Global : window.initTopoBg (appelé par main.js).
 */
function initTopoBg() {
  if (!window.createTopoNoise || !window.createTopoContours || !window.Path2D) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "topo-bg";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.prepend(canvas);

  const noise = window.createTopoNoise();
  const contours = window.createTopoContours();
  const CELL = 20; /* pas de la grille d'échantillonnage, en px CSS */
  const SCALE = 1 / 500; /* largeur des « collines » (~500 px) */
  const LEVELS = 9; /* nombre de courbes de niveau */
  const MASTER = 3; /* une courbe maîtresse (plus marquée) toutes les 3 */
  const SPEED = 0.021; /* dérive du relief — très lente */
  const FRAME_MS = 15; /* plafonne à ~60 images/s les écrans plus rapides */

  let cols = 0;
  let rows = 0;
  let w = 0;
  let h = 0;
  let values = new Float32Array(0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cols = Math.ceil(w / CELL) + 1;
    rows = Math.ceil(h / CELL) + 1;
    values = new Float32Array(cols * rows);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }

  /* Trace une polyligne en l'arrondissant : des quadratiques qui passent par
     le milieu de chaque segment — les angles deviennent des courbes. */
  function smoothLine(path, pts) {
    const n = pts.length;
    if (n < 3) {
      path.moveTo(pts[0][0], pts[0][1]);
      if (n === 2) path.lineTo(pts[1][0], pts[1][1]);
      return;
    }
    const closed =
      Math.abs(pts[0][0] - pts[n - 1][0]) + Math.abs(pts[0][1] - pts[n - 1][1]) < 0.01;
    if (closed) {
      const m = n - 1; /* le dernier point répète le premier */
      path.moveTo((pts[m - 1][0] + pts[0][0]) / 2, (pts[m - 1][1] + pts[0][1]) / 2);
      for (let i = 0; i < m; i++) {
        const next = pts[(i + 1) % m];
        path.quadraticCurveTo(
          pts[i][0], pts[i][1],
          (pts[i][0] + next[0]) / 2, (pts[i][1] + next[1]) / 2
        );
      }
      path.closePath();
      return;
    }
    path.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      path.quadraticCurveTo(
        pts[i][0], pts[i][1],
        (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2
      );
    }
    path.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }

  function draw(seconds) {
    const t = seconds * SPEED;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        values[j * cols + i] = noise.field(i * CELL * SCALE, j * CELL * SCALE, t);
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    const fine = new Path2D();
    const master = new Path2D();
    for (let l = 0; l < LEVELS; l++) {
      const level = 0.15 + (0.7 * l) / (LEVELS - 1);
      const lines = contours.trace(values, cols, rows, CELL, level);
      const path = l % MASTER === 0 ? master : fine;
      for (let k = 0; k < lines.length; k++) smoothLine(path, lines[k]);
    }
    ctx.strokeStyle = "rgba(238, 240, 244, 0.05)";
    ctx.stroke(fine);
    ctx.strokeStyle = "rgba(238, 240, 244, 0.09)";
    ctx.stroke(master);

    /* Halo de lumière : un point erre lentement sur la carte et fait
       briller les courbes qu'il traverse, teinte cobalt de la DA. */
    const gx = w * (0.5 + 0.36 * Math.sin(seconds * 0.16));
    const gy = h * (0.5 + 0.36 * Math.sin(seconds * 0.11 + 1.7));
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.4);
    glow.addColorStop(0, "rgba(205, 216, 255, 0.55)");
    glow.addColorStop(0.5, "rgba(147, 168, 255, 0.16)");
    glow.addColorStop(1, "rgba(147, 168, 255, 0)");
    ctx.strokeStyle = glow;
    /* halo diffus d'abord, puis le fil lumineux net par-dessus */
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 3.5;
    ctx.stroke(fine);
    ctx.stroke(master);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.4;
    ctx.stroke(fine);
    ctx.stroke(master);
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();

  /* Animations réduites : une carte fixe, redessinée au redimensionnement */
  if (reduce) {
    draw(0);
    window.addEventListener("resize", function () {
      resize();
      draw(0);
    });
    return;
  }

  window.addEventListener("resize", resize);

  let raf = 0;
  let last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    draw(now / 1000);
  }
  raf = requestAnimationFrame(loop);

  /* Onglet masqué : on met le rendu en pause */
  document.addEventListener("visibilitychange", function () {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(loop);
  });
}
