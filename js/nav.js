/**
 * Navigation — fond opaque au scroll + menu mobile plein écran.
 * Le menu piège le focus clavier tant qu'il est ouvert, se ferme avec
 * Échap, et se replie tout seul si la fenêtre repasse en largeur desktop
 * (où le burger n'existe plus).
 */
function initNav() {
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".menu");

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (!burger || !menu) return;

  const isOpen = () => document.body.classList.contains("menu-open");

  const toggle = (force) => {
    const open = force ?? !isOpen();
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) burger.focus();
  };

  burger.addEventListener("click", () => toggle());
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggle(false))
  );

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      toggle(false);
      return;
    }

    /* Piège de focus : on boucle entre le burger et les liens du menu */
    if (e.key !== "Tab") return;
    const focusables = [burger, ...menu.querySelectorAll("a")];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* Repli automatique quand on repasse en desktop (rotation tablette…) */
  const desktop = window.matchMedia("(min-width: 940px)");
  const onChange = (e) => {
    if (e.matches && isOpen()) toggle(false);
  };
  if (typeof desktop.addEventListener === "function") {
    desktop.addEventListener("change", onChange);
  }
}
