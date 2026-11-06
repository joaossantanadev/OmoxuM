/* Menu mobile, ano no footer, smooth scroll */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }
  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();
});