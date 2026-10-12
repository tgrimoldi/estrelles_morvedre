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

  // Google Analytics con consentimiento previo: no se carga nada (ni
  // cookies) hasta que el visitante pulsa "Aceptar". La elección se guarda
  // en este navegador y se puede cambiar desde "Configurar cookies".
  const GA_ID = "G-CDBJZQB04B";
  const CONSENT_KEY = "cookie-consent";
  const cookieBanner = document.getElementById("cookie-banner");

  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
  };
  const saveConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* sin almacenamiento */ }
  };

  let gaLoaded = false;
  const loadAnalytics = () => {
    if (gaLoaded || !GA_ID) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(tag);
  };

  // Eventos de contacto para Analytics. Solo se envían si el visitante
  // aceptó las cookies (si no, gtag no existe y no se hace nada).
  // El asunto solo se envía si es uno de los predefinidos de los botones,
  // para no mandar a Google texto escrito por el visitante.
  const KNOWN_SUBJECTS = new Set(
    [...document.querySelectorAll("a[data-prefill]")].map((a) => a.dataset.prefill)
  );
  const subjectForAnalytics = (subject) => (KNOWN_SUBJECTS.has(subject) ? subject : "otro");
  const track = (name, params = {}) => {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  };

  const removeAnalyticsCookies = () => {
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      const host = location.hostname;
      [host, `.${host}`, `.${host.replace(/^www\./, "")}`].forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
      });
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
  };

  const showCookieBanner = () => { if (cookieBanner && GA_ID) cookieBanner.hidden = false; };

  if (GA_ID) {
    const consent = readConsent();
    if (consent === "granted") loadAnalytics();
    else if (consent !== "denied") showCookieBanner();
  }

  document.querySelectorAll("[data-cookie-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.cookieChoice;
      saveConsent(choice);
      if (cookieBanner) cookieBanner.hidden = true;
      if (choice === "granted") {
        loadAnalytics();
      } else {
        removeAnalyticsCookies();
        // Si GA ya estaba cargado en esta visita, se deja de medir al recargar.
        if (gaLoaded) location.reload();
      }
    });
  });

  document.querySelectorAll("[data-cookie-settings]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!GA_ID) return;
      if (cookieBanner) cookieBanner.hidden = false;
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const CLUB_EMAIL = "rugbiclubestrelesdemorvedre@gmail.com";
  const CLUB_WA = "34647644971";

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

  // El formulario se envía a Web3Forms, que lo reenvía por email a CLUB_EMAIL.
  // La access key es pública (va en el navegador) y se gestiona desde
  // web3forms.com con la cuenta del club.
  const FORM_ENDPOINT = "https://api.web3forms.com/submit";
  const WEB3FORMS_KEY = "dacacecf-0b80-418c-890d-6f8db474cd9e";
  const submitBtn = document.getElementById("unete-submit");
  const statusEl = document.getElementById("unete-status");

  const showStatus = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = `form-status form-status--${kind}`;
    statusEl.hidden = false;
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.querySelector('[name="botcheck"]')?.checked) return;

      const name = fieldVal('[name="name"]');
      const email = fieldVal('[name="email"]');
      const subject = fieldVal('[name="subject"]') || "Mensaje desde la web";
      const message = fieldVal('[name="message"]');

      const label = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";
      }
      if (statusEl) statusEl.hidden = true;

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Web · ${subject} · ${name}`,
            from_name: "Web Estreles de Morvedre",
            replyto: email,
            Nombre: name,
            Email: email,
            Asunto: subject,
            Mensaje: message,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== "true") {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
        track("contacto_formulario", { asunto: subjectForAnalytics(subject) });
        form.reset();
        showStatus("¡Gracias! Hemos recibido tu mensaje y te responderemos por email muy pronto.", "ok");
      } catch (err) {
        console.error("Formulario: el envío a Web3Forms ha fallado →", err.message);
        showStatus(
          `No hemos podido enviar el mensaje. Prueba por WhatsApp o escríbenos a ${CLUB_EMAIL}.`,
          "error"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = label;
        }
      }
    });
  }

  const waBtn = document.getElementById("unete-whatsapp");
  if (waBtn && form) {
    waBtn.addEventListener("click", () => {
      const { subject, body } = composeMessage();
      const text = `${subject}\n\n${body}`;
      track("contacto_whatsapp", {
        ubicacion: "formulario",
        asunto: subjectForAnalytics(fieldVal('[name="subject"]')),
      });
      window.open(`https://wa.me/${CLUB_WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });
  }

  const waFloat = document.getElementById("wa-float");
  if (waFloat) {
    waFloat.addEventListener("click", () => track("contacto_whatsapp", { ubicacion: "boton_flotante" }));
  }
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

