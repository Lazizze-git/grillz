/**
 * Galerie — filtres par catégorie + lightbox fiche projet.
 */
function initGallery() {
  const grid = document.querySelector(".grid-gallery");
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll(".tile"));
  const filters = document.querySelectorAll(".filter");

  /* ---- Panneau d'infos au survol (glisse depuis le bas de la photo) ---- */
  tiles.forEach((tile) => {
    if (tile.querySelector(".tile__info")) return;
    const d = tile.dataset;
    const rows = [
      ["Matière", d.material],
      ["Pièces", d.teeth],
      ["Fabrication", d.duree],
      ["Style", d.style],
    ].filter((r) => r[1]);
    const info = document.createElement("div");
    info.className = "tile__info";
    info.setAttribute("aria-hidden", "true");
    info.innerHTML =
      `<div class="tile__info-top"><span class="tile__info-ref">${
        d.ref || ""
      }</span></div>` +
      `<span class="tile__info-name">${d.name || ""}</span>` +
      `<dl class="tile__info-specs">` +
      rows.map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("") +
      `</dl>`;
    tile.appendChild(info);
  });

  /* ---- Filtres + compteur ---- */
  const countEl = document.querySelector("[data-count]");
  const updateCount = () => {
    if (!countEl) return;
    const n = tiles.filter((t) => !t.classList.contains("is-hidden")).length;
    countEl.textContent = `${String(n).padStart(2, "0")} vues`;
  };

  /* Relance l'apparition en fondu des tuiles visibles après un filtrage */
  const replayFilterIn = () => {
    grid.classList.remove("is-filtering");
    void grid.offsetWidth; /* force le redémarrage de l'animation */
    grid.classList.add("is-filtering");
  };

  /* Nombre de vues par catégorie, affiché dans chaque pastille */
  const countFor = (cat) =>
    cat === "all"
      ? tiles.length
      : tiles.filter((t) => t.dataset.cat.split(" ").includes(cat)).length;

  filters.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.classList.contains("is-active")));
    if (!btn.querySelector(".filter__count")) {
      const count = document.createElement("span");
      count.className = "filter__count";
      count.setAttribute("aria-hidden", "true");
      count.textContent = String(countFor(btn.dataset.filter)).padStart(2, "0");
      btn.appendChild(count);
    }
    btn.addEventListener("click", () => {
      filters.forEach((f) => {
        f.classList.remove("is-active");
        f.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      const cat = btn.dataset.filter;
      tiles.forEach((tile) => {
        const match =
          cat === "all" || tile.dataset.cat.split(" ").includes(cat);
        tile.classList.toggle("is-hidden", !match);
      });
      updateCount();
      replayFilterIn();
    });
  });
  updateCount();

  /* ---- Lightbox ---- */
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  const lbImg = lightbox.querySelector(".lightbox__media img");
  const lbName = lightbox.querySelector(".lightbox__name");
  const lbDetails = lightbox.querySelector(".lightbox__details");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  let lastTile = null; /* pour rendre le focus à la tuile d'origine */

  const open = (tile) => {
    lastTile = tile;
    const d = tile.dataset;
    const img = tile.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbName.textContent = d.name;

    const rows = [
      ["Référence", d.ref],
      ["Matériau", d.material],
      ["Pièces", d.teeth],
      ["Fabrication", d.duree],
      ["Style", d.style],
    ].filter(([, v]) => v);

    lbDetails.innerHTML = rows
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");

    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    lastTile?.focus();
  };

  /* Desktop (survol possible) : clic = fiche détaillée.
     Mobile / tactile : tap = ouvre le panneau d'infos, re-tap ou scroll = ferme. */
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const toggleReveal = (tile) => {
    const isOpen = tile.classList.contains("is-revealed");
    tiles.forEach((t) => t.classList.remove("is-revealed"));
    if (!isOpen) tile.classList.add("is-revealed");
  };

  tiles.forEach((tile) => {
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.addEventListener("click", () => {
      if (canHover) open(tile);
      else toggleReveal(tile);
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (canHover) open(tile);
        else toggleReveal(tile);
      }
    });
  });

  if (!canHover) {
    window.addEventListener(
      "scroll",
      () => {
        tiles.forEach((t) => t.classList.remove("is-revealed"));
      },
      { passive: true }
    );
  }

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      close();
      return;
    }

    /* Piège de focus : Tab boucle entre le bouton fermer et le lien CTA */
    if (e.key !== "Tab") return;
    const focusables = lightbox.querySelectorAll("button, a[href]");
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
}
