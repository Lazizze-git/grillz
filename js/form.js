/**
 * Formulaire de co-création — multi-étapes, progression, validation légère,
 * récapitulatif dynamique, écran de succès.
 * Démo front : aucune donnée n'est réellement envoyée (branchement back à prévoir).
 */
function initForm() {
  const form = document.querySelector(".cocreation");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".fstep"));
  const bars = Array.from(form.querySelectorAll(".cocreation__progress span"));
  const success = form.querySelector(".form-success");
  let current = 0;

  const show = (i) => {
    steps.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    bars.forEach((b, idx) => b.classList.toggle("is-done", idx <= i));
    current = i;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const flag = (el) => {
    el.classList.add("field--error");
    setTimeout(() => el.classList.remove("field--error"), 1000);
  };

  const validate = (stepEl) => {
    const required = stepEl.querySelectorAll("[required]");
    for (const field of required) {
      if (field.type === "radio") {
        const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
        if (![...group].some((r) => r.checked)) {
          flag(field.closest(".field") || field);
          return false;
        }
      } else if (!field.value.trim() || !field.checkValidity()) {
        /* checkValidity couvre le format (email…) en plus du champ vide */
        flag(field.closest(".field") || field);
        field.focus();
        return false;
      }
    }
    return true;
  };

  form.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validate(steps[current])) return;
      if (current < steps.length - 1) {
        if (current === steps.length - 2) buildRecap();
        show(current + 1);
      }
    });
  });

  form.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (current > 0) show(current - 1);
    });
  });

  /* Slider budget */
  const slider = form.querySelector('input[type="range"]');
  const output = form.querySelector(".slider-wrap output");
  if (slider && output) {
    const fmt = (v) =>
      Number(v) >= 25000
        ? "25 000 CHF +"
        : `${Number(v).toLocaleString("fr-CH")} CHF`;
    const update = () => (output.textContent = fmt(slider.value));
    slider.addEventListener("input", update);
    update();
  }

  /* Upload — nombre de fichiers */
  const upload = form.querySelector(".upload input");
  const uploadLabel = form.querySelector(".upload__text");
  if (upload && uploadLabel) {
    const base = uploadLabel.textContent;
    upload.addEventListener("change", () => {
      uploadLabel.textContent = upload.files.length
        ? `${upload.files.length} fichier(s) ajouté(s)`
        : base;
    });
  }

  /* Récapitulatif */
  function buildRecap() {
    const recap = form.querySelector(".recap");
    if (!recap) return;
    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return "—";
      if (el.type === "radio") {
        const checked = form.querySelector(`[name="${name}"]:checked`);
        return checked ? checked.dataset.label || checked.value : "—";
      }
      return el.value || "—";
    };
    const rows = [
      ["Prénom", get("prenom")],
      ["Pays", get("pays")],
      ["Type de pièce", get("piece")],
      ["Matériau", get("materiau")],
      ["Budget", slider ? output.textContent : "—"],
      ["Échéance", get("date") || "Flexible"],
    ];
    recap.innerHTML = rows
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v || "—"}</dd></div>`)
      .join("");
  }

  /* Soumission */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(steps[current])) return;
    steps.forEach((s) => s.classList.remove("is-active"));
    form.querySelector(".cocreation__progress")?.setAttribute("hidden", "");
    success?.classList.add("is-shown");
    success?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
