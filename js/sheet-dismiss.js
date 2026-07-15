/**
 * Fermeture gestuelle d'une feuille plein écran (lightbox) :
 * — tactile : glisser vers le bas, la feuille suit le doigt puis se ferme ;
 * — molette / trackpad : défilement vers le bas quand tout est déjà visible.
 */
function attachSheetDismiss(sheet, onClose) {
  var DRAG_CLOSE = 100; /* glissement (px) au-delà duquel on ferme */
  var WHEEL_CLOSE = 220; /* cumul de molette (px) au-delà duquel on ferme */

  var atTop = function () {
    return sheet.scrollTop <= 0;
  };
  var atBottom = function () {
    return sheet.scrollTop + sheet.clientHeight >= sheet.scrollHeight - 1;
  };

  var dismiss = function () {
    /* La feuille file vers le bas pendant que le voile s'estompe */
    sheet.style.transition = "";
    sheet.style.transform = "translateY(110%)";
    onClose();
    setTimeout(function () {
      sheet.style.transform = "";
    }, 500);
  };

  /* ---- Tactile : la feuille suit le doigt ---- */
  var startY = null;
  var delta = 0;

  sheet.addEventListener(
    "touchstart",
    function (e) {
      if (!atTop()) return;
      startY = e.touches[0].clientY;
      delta = 0;
    },
    { passive: true }
  );

  sheet.addEventListener(
    "touchmove",
    function (e) {
      if (startY === null) return;
      delta = e.touches[0].clientY - startY;
      if (delta <= 0) {
        sheet.style.transform = "";
        return;
      }
      e.preventDefault();
      sheet.style.transition = "none";
      sheet.style.transform = "translateY(" + delta + "px)";
    },
    { passive: false }
  );

  var endDrag = function () {
    if (startY === null) return;
    var shouldClose = delta > DRAG_CLOSE;
    startY = null;
    delta = 0;
    if (shouldClose) {
      dismiss();
      return;
    }
    /* Pas assez glissé : la feuille revient en place */
    sheet.style.transition = "";
    sheet.style.transform = "";
  };
  sheet.addEventListener("touchend", endDrag);
  sheet.addEventListener("touchcancel", endDrag);

  /* ---- Molette / trackpad : défiler vers le bas ferme la fiche ---- */
  var wheelSum = 0;
  var wheelTimer = 0;

  sheet.addEventListener(
    "wheel",
    function (e) {
      if (e.deltaY <= 0 || !atBottom()) {
        wheelSum = 0;
        return;
      }
      wheelSum += e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () {
        wheelSum = 0;
      }, 400);
      if (wheelSum > WHEEL_CLOSE) {
        wheelSum = 0;
        dismiss();
      }
    },
    { passive: true }
  );
}
