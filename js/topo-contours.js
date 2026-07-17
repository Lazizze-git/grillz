/**
 * Fond topographique — extraction des courbes de niveau (« marching squares »)
 * puis chaînage des petits segments en polylignes continues. C'est ce qui
 * permet à topo-bg.js de tracer chaque courbe d'un seul geste, en Bézier
 * lissées, au lieu d'une suite de traits droits anguleux.
 * Global : window.createTopoContours — consommé par js/topo-bg.js.
 */
function createTopoContours() {
  "use strict";

  /* Segments de contour par configuration de cellule (marching squares).
     Bords : 0 = haut, 1 = droite, 2 = bas, 3 = gauche. */
  const CASES = [
    [], [[3, 2]], [[2, 1]], [[3, 1]],
    [[0, 1]], [[0, 1], [3, 2]], [[0, 2]], [[0, 3]],
    [[0, 3]], [[0, 2]], [[0, 3], [1, 2]], [[0, 1]],
    [[3, 1]], [[2, 1]], [[3, 2]], [],
  ];

  /* Position de la traversée du niveau entre deux altitudes */
  function crossing(v0, v1, level) {
    const d = v1 - v0;
    if (d === 0) return 0.5;
    return Math.min(Math.max((level - v0) / d, 0), 1);
  }

  /* Clé entière d'un point (quantifié au quart de pixel) : deux segments
     voisins partagent exactement la même clé à leur point de jonction */
  function pointKey(p) {
    return Math.round(p[0] * 4) * 0x80000 + Math.round(p[1] * 4);
  }

  /* Récolte les segments bruts d'un niveau, cellule par cellule */
  function collectSegments(values, cols, rows, cell, level) {
    const segs = [];
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

        const x = i * cell;
        const y = j * cell;
        /* Points d'intersection sur les 4 bords de la cellule */
        const pts = [
          [x + cell * crossing(a, b, level), y],
          [x + cell, y + cell * crossing(b, c, level)],
          [x + cell * crossing(d, c, level), y + cell],
          [x, y + cell * crossing(a, d, level)],
        ];
        const edges = CASES[code];
        for (let s = 0; s < edges.length; s++) {
          segs.push([pts[edges[s][0]], pts[edges[s][1]]]);
        }
      }
    }
    return segs;
  }

  function addNeighbour(adj, key, index) {
    const list = adj.get(key);
    if (list) list.push(index);
    else adj.set(key, [index]);
  }

  /* Prolonge une polyligne depuis son dernier point, segment après segment,
     tant qu'un segment libre partage ce point */
  function extend(line, adj, segs, used) {
    for (;;) {
      const key = pointKey(line[line.length - 1]);
      const list = adj.get(key);
      let next = null;
      if (list) {
        for (let k = 0; k < list.length && !next; k++) {
          const index = list[k];
          if (used[index]) continue;
          used[index] = 1;
          const seg = segs[index];
          next = pointKey(seg[0]) === key ? seg[1] : seg[0];
        }
      }
      if (!next) return;
      line.push(next);
    }
  }

  /* Chaîne les segments bout à bout en polylignes continues */
  function linkSegments(segs) {
    const adj = new Map();
    for (let i = 0; i < segs.length; i++) {
      addNeighbour(adj, pointKey(segs[i][0]), i);
      addNeighbour(adj, pointKey(segs[i][1]), i);
    }
    const used = new Uint8Array(segs.length);
    const lines = [];
    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      used[i] = 1;
      const line = [segs[i][0], segs[i][1]];
      extend(line, adj, segs, used); /* vers l'avant… */
      line.reverse();
      extend(line, adj, segs, used); /* …puis vers l'arrière */
      lines.push(line);
    }
    return lines;
  }

  /* Toutes les courbes d'un niveau, sous forme de polylignes [x, y][] */
  function trace(values, cols, rows, cell, level) {
    return linkSegments(collectSegments(values, cols, rows, cell, level));
  }

  return { trace: trace };
}
