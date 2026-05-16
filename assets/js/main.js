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

  const CLUB_EMAIL = "rugbiclubestrelesdemorvedre@gmail.com";
  const CLUB_WA = "34661543893";

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

  const fieldVal = (sel) => (form && form.querySelector(sel)?.value.trim()) || "";

  const composeMessage = () => {
    const name = fieldVal('[name="name"]');
    const subject = fieldVal('[name="subject"]') || "Mensaje desde la web";
    const message = fieldVal('[name="message"]');
    let body = "";
    if (name) body += `Hola, soy ${name}.\n\n`;
    if (message) body += `${message}\n\n`;
    body += "— Enviado desde la web";
    return { subject, body };
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = fieldVal('[name="email"]');
      const { subject, body } = composeMessage();
      const params = new URLSearchParams({ subject, body });
      const replyTo = email ? `&reply-to=${encodeURIComponent(email)}` : "";
      window.location.href = `mailto:${CLUB_EMAIL}?${params.toString()}${replyTo}`;
    });
  }

  const waBtn = document.getElementById("unete-whatsapp");
  if (waBtn && form) {
    waBtn.addEventListener("click", () => {
      const { subject, body } = composeMessage();
      const text = `${subject}\n\n${body}`;
      window.open(`https://wa.me/${CLUB_WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });
  }

  const waFloat = document.getElementById("wa-float");
  const uneteSection = document.getElementById("unete");
  if (waFloat && uneteSection && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => waFloat.classList.toggle("wa-float--hidden", e.isIntersecting)),
      { threshold: 0.15 }
    );
    obs.observe(uneteSection);
  }

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

