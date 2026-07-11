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

  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const imgEl = lightbox.querySelector(".lightbox-img");
    const counterEl = lightbox.querySelector(".lightbox-counter");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    const groups = new Map();
    document.querySelectorAll("a[data-lightbox]").forEach((link) => {
      const key = link.dataset.lightbox;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(link);
    });

    let items = [];
    let index = 0;
    let lastFocused = null;

    const render = () => {
      const link = items[index];
      const thumb = link.querySelector("img");
      imgEl.src = link.getAttribute("href");
      imgEl.alt = (thumb && thumb.alt) || "";
      const multi = items.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      counterEl.textContent = multi ? `${index + 1} / ${items.length}` : "";
    };

    const open = (groupItems, startIndex) => {
      items = groupItems;
      index = startIndex;
      lastFocused = document.activeElement;
      render();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      imgEl.src = "";
      items = [];
      if (lastFocused) lastFocused.focus();
    };

    const next = () => { index = (index + 1) % items.length; render(); };
    const prev = () => { index = (index - 1 + items.length) % items.length; render(); };

    groups.forEach((groupItems) => {
      groupItems.forEach((link, i) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          open(groupItems, i);
        });
      });
    });

    closeBtn.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox-stage")) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowRight") { next(); return; }
      if (e.key === "ArrowLeft") { prev(); return; }
      if (e.key === "Tab") {
        const focusables = [closeBtn, prevBtn, nextBtn].filter((el) => !el.hidden);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) next(); else prev();
    }, { passive: true });
  }
})();

