/**
 * Fond topographique — bruit de valeur 3D (x, y, temps), deux octaves.
 * Produit un champ d'altitude lisse et organique ; ses courbes de niveau
 * dessinent une carte topographique qui évolue lentement dans le temps.
 * Global : window.createTopoNoise — consommé par js/topo-bg.js.
 */
function createTopoNoise() {
  "use strict";

  /* Hash entier → valeur pseudo-aléatoire stable dans [0, 1) */
  function hash(x, y, z) {
    let h =
      Math.imul(x, 0x27d4eb2d) ^
      Math.imul(y, 0x165667b1) ^
      Math.imul(z, 0x9e3779b9);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  }

  /* Adoucit l'interpolation (évite les cassures aux frontières) */
  function fade(t) {
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Bruit de valeur : interpolation trilinéaire entre les 8 coins du cube */
  function noise3(x, y, z) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);
    const fx = fade(x - ix);
    const fy = fade(y - iy);
    const fz = fade(z - iz);

    const x00 = lerp(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx);
    const x10 = lerp(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx);
    const x01 = lerp(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx);
    const x11 = lerp(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx);

    return lerp(lerp(x00, x10, fy), lerp(x01, x11, fy), fz);
  }

  /* Deux octaves : grandes collines + léger détail, comme un vrai relief */
  function field(x, y, t) {
    return (
      noise3(x, y, t) * 0.72 +
      noise3(x * 2.3 + 31.7, y * 2.3 + 11.3, t * 1.6) * 0.28
    );
  }

  return { field: field };
}
