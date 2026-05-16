(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById("unete-form");
  const subjectField = document.getElementById("unete-subject");

  document.querySelectorAll("a[data-prefill]").forEach((link) => {
    link.addEventListener("click", () => {
      if (subjectField) subjectField.value = link.dataset.prefill;
      if (!form) return;
      window.setTimeout(() => {
        const fields = form.querySelectorAll("input, textarea");
        for (const f of fields) {
          if (!f.value) { f.focus({ preventScroll: true }); return; }
        }
      }, 700);
    });
  });

  document.querySelectorAll(".cronica-toggle").forEach((btn) => {
    const grid = document.getElementById(btn.getAttribute("aria-controls"));
    if (!grid) return;
    btn.addEventListener("click", () => {
      const collapsed = grid.dataset.collapsed === "true";
      grid.dataset.collapsed = collapsed ? "false" : "true";
      btn.setAttribute("aria-expanded", collapsed ? "true" : "false");
      btn.textContent = collapsed
        ? btn.dataset.labelExpanded
        : btn.dataset.labelCollapsed;
      if (!collapsed) {
        grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });
})();

