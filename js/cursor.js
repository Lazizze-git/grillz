/**
 * Curseur custom — point + anneau avec léger lag.
 * Désactivé sur tactile / pointeur grossier.
 */
function initCursor() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine) return;

  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  document.body.classList.add("has-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function render() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(render);
  }
  render();

  const interactive =
    "a, button, .choice, .tile, .filter, .cat-card, input, textarea, label";
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener("mouseenter", () =>
      cursor.classList.add("cursor--active")
    );
    el.addEventListener("mouseleave", () =>
      cursor.classList.remove("cursor--active")
    );
  });

  document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
  document.addEventListener("mouseenter", () => (cursor.style.opacity = "1"));
}
