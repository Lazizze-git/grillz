/**
 * Galerie — filtres par catégorie + lightbox fiche projet.
 */
function initGallery() {
  const grid = document.querySelector(".grid-gallery");
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll(".tile"));
  const filters = document.querySelectorAll(".filter");

  /* ---- Panneau d'infos au survol, desktop uniquement (bandeau bas de photo) ---- */
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
  const lbMediaRef = lightbox.querySelector(".lightbox__media-ref");
  const lbIdRef = lightbox.querySelector(".lightbox__id-ref");
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
    lbIdRef.textContent = d.ref || "";
    lbMediaRef.textContent = d.ref ? `Ref: ${d.ref}` : "";

    const rows = [
      ["Référence", d.ref],
      ["Matériau", d.material],
      ["Pièces", d.teeth],
      ["Fabrication", d.duree],
      ["Style", d.style],
    ].filter(([, v]) => v);

    /* Caractéristiques numérotées façon spec sheet : 01 // Référence */
    lbDetails.innerHTML = rows
      .map(
        ([k, v], i) =>
          `<div><dt><i>${String(i + 1).padStart(2, "0")} //</i> ${k}</dt><dd>${v}</dd></div>`
      )
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

  /* Glisser la fiche vers le bas (ou molette vers le bas) la ferme */
  if (typeof window.attachSheetDismiss === "function") {
    window.attachSheetDismiss(lightbox.querySelector(".lightbox__inner"), close);
  }

  /* Clic ou tap = fiche détaillée (le panneau au survol reste réservé au desktop) */
  tiles.forEach((tile) => {
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.addEventListener("click", () => open(tile));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(tile);
      }
    });
  });

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
