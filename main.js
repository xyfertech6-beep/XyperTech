/* =========================================================
   Xyfer Tech — main.js
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Preloader ---------- */
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => preloader.classList.add("hide"), 350);
    });
    // fallback in case load already fired
    setTimeout(() => preloader.classList.add("hide"), 1800);
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");

    const backTop = document.querySelector(".back-to-top");
    if (backTop) {
      if (window.scrollY > 600) backTop.classList.add("show");
      else backTop.classList.remove("show");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
      document.body.style.overflow = mobileMenu.classList.contains("is-open")
        ? "hidden"
        : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" },
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--i", i % 8);
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const value = target * eased;
      el.textContent =
        (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Portfolio filter ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const workCards = document.querySelectorAll(".work-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      workCards.forEach((card) => {
        const match = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------- Testimonial slider ---------- */
  const track = document.querySelector(".testi-track");
  if (track) {
    const cards = track.children.length;
    const perView =
      window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
    let index = 0;
    const maxIndex = Math.max(0, cards - perView);
    const update = () => {
      const cardWidth = track.children[0].getBoundingClientRect().width + 24;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
    };
    document.querySelector(".testi-next")?.addEventListener("click", () => {
      index = index >= maxIndex ? 0 : index + 1;
      update();
    });
    document.querySelector(".testi-prev")?.addEventListener("click", () => {
      index = index <= 0 ? maxIndex : index - 1;
      update();
    });
    window.addEventListener("resize", update);
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const q = item.querySelector(".accordion-q");
    const a = item.querySelector(".accordion-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".accordion-item").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".accordion-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const wrap = field.closest(".form-field");
        const emailOk =
          field.type !== "email" ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!field.value.trim() || !emailOk) {
          wrap.classList.add("invalid");
          valid = false;
        } else {
          wrap.classList.remove("invalid");
        }
      });
      if (!valid) return;

      const successEl = document.querySelector(".form-success");
      const errorEl = document.querySelector(".form-error");
      const submitBtn = form.querySelector('button[type="submit"]');
      errorEl?.classList.remove("show");
      submitBtn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Submission failed");
        form.reset();
        successEl?.classList.add("show");
        setTimeout(() => successEl?.classList.remove("show"), 5000);
      } catch (err) {
        errorEl?.classList.add("show");
        setTimeout(() => errorEl?.classList.remove("show"), 6000);
      } finally {
        submitBtn.disabled = false;
      }
    });
    form.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () =>
        field.closest(".form-field").classList.remove("invalid"),
      );
    });
  }

  /* ---------- Back to top ---------- */
  document.querySelector(".back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Cursor spark (desktop only, subtle) ---------- */
  const cursor = document.querySelector(".cursor-spark");
  if (
    cursor &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    let raf = null;
    document.addEventListener("mousemove", (e) => {
      cursor.style.opacity = "0.85";
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      });
    });
    document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector(".scroll-progress");
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progressBar.style.width = scrolled + "%";
    };
    document.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".btn-primary, .btn-light").forEach((btn) => {
      btn.classList.add("magnetic");
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tiltEls = document.querySelectorAll(
      ".service-card, .price-card, .team-card .avatar, .work-card",
    );
    tiltEls.forEach((card) => {
      card.style.transition =
        "transform .25s ease-out, box-shadow .4s ease-out";
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = (py * -8).toFixed(2);
        const rotY = (px * 10).toFixed(2);
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.015)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Ambient spark particles (hero canvases) ---------- */
  document.querySelectorAll(".particles-canvas").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const colors = ["#00e5ff", "#7c5cfc", "#ff2e9a", "#ffb627"];

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
    };

    const makeParticles = () => {
      const count = window.innerWidth < 700 ? 26 : 48;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.5 + 0.25,
      }));
    };

    resize();
    makeParticles();
    window.addEventListener("resize", () => {
      resize();
      makeParticles();
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      particles.forEach((p) => {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
});
