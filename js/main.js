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
    safe(window.initScrollReveal, "initScrollReveal");
    safe(window.initNav, "initNav");
    safe(window.initGallery, "initGallery");
    safe(window.initForm, "initForm");
    safe(window.initYear, "initYear");
    safe(window.initCursor, "initCursor");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
