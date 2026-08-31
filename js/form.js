/**
 * Formulaire de co-création — multi-étapes, progression, validation légère,
 * récapitulatif dynamique, écran de succès.
 * L'envoi passe par envoi.php, à la racine du site (hébergement PHP).
 */
function initForm() {
  const form = document.querySelector(".cocreation");
  if (!form) return;

  /* Jeton de page — horodatage d'ouverture suivi d'une somme de contrôle que
     spam-filter.php recalcule à l'identique. Un robot qui poste directement
     sur envoi.php, sans jamais afficher la page, ne peut pas le produire ; le
     serveur en déduit aussi le temps de remplissage. Le sel et la boucle
     doivent rester identiques des deux côtés (voir tests/). */
  const SEL_JETON = "antispam-v1";
  const jeton = form.querySelector('[name="jeton"]');
  if (jeton) {
    const secondes = Math.floor(Date.now() / 1000);
    const source = SEL_JETON + ":" + secondes;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
    }
    jeton.value = secondes + "." + hash.toString(36);
  }

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
    /* Le plafond suit celui du curseur : le CMS peut le déplacer. */
    const fmt = (v) => {
      const max = Number(slider.max);
      const n = Number(v);
      return n >= max
        ? `${max.toLocaleString("fr-CH")} CHF +`
        : `${n.toLocaleString("fr-CH")} CHF`;
    };
    const update = () => (output.textContent = fmt(slider.value));
    slider.addEventListener("input", update);
    update();
  }

  /* Upload — nombre de fichiers */
  const upload = form.querySelector(".upload input");
  const uploadLabel = form.querySelector(".upload__text");
  if (upload && uploadLabel) {
    /* Le texte d'origine est mis de côté : le CMS peut le remplacer ensuite. */
    if (!uploadLabel.dataset.base) uploadLabel.dataset.base = uploadLabel.textContent;
    upload.addEventListener("change", () => {
      uploadLabel.textContent = upload.files.length
        ? `${upload.files.length} fichier(s) ajouté(s)`
        : uploadLabel.dataset.base;
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

  /* Soumission — les réponses partent vers envoi.php, qui écrit à l'atelier. */
  const send = form.querySelector('[type="submit"]');
  const alert = document.createElement("p");
  alert.className = "form-error";
  alert.setAttribute("role", "alert");
  alert.hidden = true;
  send?.closest(".fnav")?.before(alert);

  const en = () => window.MA_LANG === "en";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(steps[current])) return;

    alert.hidden = true;
    send.disabled = true;
    const label = send.innerHTML;
    send.textContent = en() ? "Sending…" : "Envoi…";

    try {
      const body = new FormData(form);
      ["piece", "materiau", "urgence"].forEach((name) => {
        const checked = form.querySelector(`[name="${name}"]:checked`);
        if (checked && checked.dataset.label) body.append(name + "_label", checked.dataset.label);
      });
      const res = await fetch("envoi.php", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "");

      steps.forEach((s) => s.classList.remove("is-active"));
      form.querySelector(".cocreation__progress")?.setAttribute("hidden", "");
      success?.classList.add("is-shown");
      success?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      /* L'échec ne doit jamais coûter le contact : on redonne l'adresse. */
      const raison =
        err.message ||
        (en() ? "The message could not be sent." : "L'envoi n'a pas abouti.");
      alert.textContent = en()
        ? `${raison} Please write to alan.alliani2503@gmail.com.`
        : `${raison} Écrivez-nous à alan.alliani2503@gmail.com.`;
      alert.hidden = false;
      send.disabled = false;
      send.innerHTML = label;
    }
  });
}
