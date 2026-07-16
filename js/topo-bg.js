/**
 * Fond topographique animé — courbes de niveau très discrètes derrière le
 * contenu, comme une carte d'altitude qui dérive lentement (réf. bor.co.id).
 * Canvas 2D natif, aucune librairie ; les courbes sont extraites du champ
 * d'altitude (topo-noise.js) par « marching squares ». Le calque est créé
 * par ce script : sans JavaScript, le site garde simplement son fond uni.
 * - « prefers-reduced-motion » : une seule image fixe, pas d'animation.
 * - Onglet masqué : rendu en pause.
 * Global : window.initTopoBg (appelé par main.js).
 */
function initTopoBg() {
  if (!window.createTopoNoise || !window.Path2D) return;

  const canvas = document.createElement("canvas");
  canvas.className = "topo-bg";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.prepend(canvas);

  const noise = window.createTopoNoise();
  const CELL = 26; /* pas de la grille d'échantillonnage, en px CSS */
  const SCALE = 1 / 420; /* largeur des « collines » (~420 px) */
  const LEVELS = 9; /* nombre de courbes de niveau */
  const MASTER = 3; /* une courbe maîtresse (plus marquée) toutes les 3 */
  const SPEED = 0.021; /* dérive du relief — très lente */
  const FRAME_MS = 1000 / 30; /* 30 images/s suffisent largement */

  /* Segments de contour par configuration de cellule (marching squares).
     Bords : 0 = haut, 1 = droite, 2 = bas, 3 = gauche. */
  const CASES = [
    [], [[3, 2]], [[2, 1]], [[3, 1]],
    [[0, 1]], [[0, 1], [3, 2]], [[0, 2]], [[0, 3]],
    [[0, 3]], [[0, 2]], [[0, 3], [1, 2]], [[0, 1]],
    [[3, 1]], [[2, 1]], [[3, 2]], [],
  ];

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
  }

  /* Position de la traversée du niveau entre deux altitudes */
  function crossing(v0, v1, level) {
    const d = v1 - v0;
    if (d === 0) return 0.5;
    return Math.min(Math.max((level - v0) / d, 0), 1);
  }

  /* Trace toutes les courbes d'un niveau donné dans le chemin fourni */
  function contour(path, level) {
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = values[j * cols + i];
        const b = values[j * cols + i + 1];
        const c = values[(j + 1) * cols + i + 1];
        const d = values[(j + 1) * cols + i];
        let code = 0;
        if (a > level) code |= 8;
        if (b > level) code |= 4;
        if (c > level) code |= 2;
        if (d > level) code |= 1;
        if (code === 0 || code === 15) continue;

        const x = i * CELL;
        const y = j * CELL;
        /* Points d'intersection sur les 4 bords de la cellule */
        const pts = [
          [x + CELL * crossing(a, b, level), y],
          [x + CELL, y + CELL * crossing(b, c, level)],
          [x + CELL * crossing(d, c, level), y + CELL],
          [x, y + CELL * crossing(a, d, level)],
        ];
        const segs = CASES[code];
        for (let s = 0; s < segs.length; s++) {
          path.moveTo(pts[segs[s][0]][0], pts[segs[s][0]][1]);
          path.lineTo(pts[segs[s][1]][0], pts[segs[s][1]][1]);
        }
      }
    }
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
      contour(l % MASTER === 0 ? master : fine, level);
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
