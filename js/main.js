/**
 * Point d'entrée JS — orchestre les modules.
 * Scripts classiques chargés en <script defer> : fonctionne aussi en ouvrant
 * le fichier directement (file://), sans serveur. Chaque init est isolé :
 * une erreur dans un module n'empêche pas les autres.
 */
(function () {
  "use strict";

  function safe(fn, name) {
    try {
      if (typeof fn === "function") fn();
    } catch (err) {
      console.error("[init] " + name + " :", err);
    }
  }

  function boot() {
    safe(window.initTopoBg, "initTopoBg");
    safe(window.initScrollReveal, "initScrollReveal");
    safe(window.initNav, "initNav");
    safe(window.initGallery, "initGallery");
    safe(window.initForm, "initForm");
    safe(window.initYear, "initYear");
    safe(window.initClock, "initClock");
    safe(window.initCursor, "initCursor");
  }

  /* Le contenu du CMS arrive après coup : on reprend alors les éléments
     nouvellement injectés (galerie, catalogue, apparitions au scroll). */
  function refresh() {
    safe(window.initScrollReveal, "initScrollReveal (CMS)");
    safe(window.initGallery, "initGallery (CMS)");
  }

  function start() {
    boot();
    if (window.cmsReady && typeof window.cmsReady.then === "function") {
      window.cmsReady.then(refresh, refresh);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
