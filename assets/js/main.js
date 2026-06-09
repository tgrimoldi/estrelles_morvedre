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

  const isImageHref = (href) => /\.(jpe?g|png|webp|gif)$/i.test(href || "");

  const cronicaGalleries = Array.from(document.querySelectorAll(".cronica"))
    .map((cronica) => Array.from(cronica.querySelectorAll("a[href]")).filter((a) => isImageHref(a.getAttribute("href"))))
    .filter((links) => links.length > 0);

  if (cronicaGalleries.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Visor de imágenes");
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Cerrar (Esc)">×</button>
      <button class="lightbox-prev" type="button" aria-label="Anterior (←)">‹</button>
      <button class="lightbox-next" type="button" aria-label="Siguiente (→)">›</button>
      <figure class="lightbox-stage">
        <img class="lightbox-img" alt="" />
        <figcaption class="lightbox-counter" aria-live="polite"></figcaption>
      </figure>
    `;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector(".lightbox-img");
    const counterEl = lightbox.querySelector(".lightbox-counter");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    let currentGroup = [];
    let currentIndex = 0;
    let lastFocused = null;

    const preload = (i) => {
      const item = currentGroup[i];
      if (item) {
        const img = new Image();
        img.src = item.src;
      }
    };

    const show = (index) => {
      if (!currentGroup.length) return;
      const len = currentGroup.length;
      currentIndex = ((index % len) + len) % len;
      const item = currentGroup[currentIndex];
      imgEl.src = item.src;
      imgEl.alt = item.alt || "";
      counterEl.textContent = `${currentIndex + 1} / ${len}`;
      const showNav = len > 1;
      prevBtn.hidden = !showNav;
      nextBtn.hidden = !showNav;
      counterEl.hidden = !showNav;
      preload(currentIndex + 1);
      preload(currentIndex - 1);
    };

    const open = (group, index, trigger) => {
      currentGroup = group;
      lastFocused = trigger || document.activeElement;
      show(index);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      imgEl.removeAttribute("src");
      currentGroup = [];
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus({ preventScroll: true });
      }
      lastFocused = null;
    };

    cronicaGalleries.forEach((links) => {
      const group = links.map((a) => ({
        src: a.getAttribute("href"),
        alt: a.querySelector("img")?.alt || "",
      }));
      links.forEach((link, i) => {
        link.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          open(group, i, link);
        });
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(currentIndex - 1));
    nextBtn.addEventListener("click", () => show(currentIndex + 1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === imgEl.parentElement) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(currentIndex - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(currentIndex + 1); }
    });

    let touchStartX = null;
    let touchStartY = null;
    lightbox.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(currentIndex + 1);
        else show(currentIndex - 1);
      }
      touchStartX = null;
      touchStartY = null;
    }, { passive: true });
  }
})();

