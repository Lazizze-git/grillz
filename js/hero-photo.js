/**
 * Photo du haut de l'accueil : le cadre adopte le format de la photo.
 * On lit les dimensions réelles de l'image et on pose --hero-ratio sur la
 * figure ; le CSS s'en sert comme aspect-ratio. Une photo verticale est donc
 * montrée entière, une horizontale aussi. Le ratio est borné pour que le
 * cadre reste raisonnable (ni ruban, ni colonne trop fine).
 * Réentrant : l'image du CMS remplace celle du HTML, l'événement load la
 * rattrape.
 */
function initHeroPhoto() {
  const figure = document.querySelector(".hero__visual");
  const img = figure && figure.querySelector("img");
  if (!img) return;

  const apply = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = Math.min(1.5, Math.max(0.6, img.naturalWidth / img.naturalHeight));
    figure.style.setProperty("--hero-ratio", ratio.toFixed(3));
  };

  if (!img.dataset.heroRatio) {
    img.dataset.heroRatio = "1";
    img.addEventListener("load", apply);
  }
  if (img.complete) apply();
}
