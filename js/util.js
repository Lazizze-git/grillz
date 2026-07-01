/**
 * Utilitaires partagés.
 * Marque le document « JS actif » au plus tôt : les éléments .reveal ne se
 * masquent que si JS est présent (amélioration progressive, jamais de page blanche).
 */
document.documentElement.classList.add("js");

function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}
