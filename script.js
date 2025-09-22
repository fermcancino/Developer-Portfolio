/* Consolidated & cleaned script for your site.
   Replace your current JS with this (or include it after your DOM). */

(() => {
  // ---------- Helpers ----------
  const waitTransition = (el, timeout = 800) => new Promise(resolve => {
    if (!el) return resolve();
    let done = false;
    const onEnd = (e) => {
      if (e.target !== el) return;
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      clearTimeout(timer);
      resolve();
    };
    el.addEventListener("transitionend", onEnd);
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      resolve();
    }, timeout);
  });

  // Safe query helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---------- Globals that should exist early ----------
  // about video & theme function must be available before theme toggle uses them
  const aboutVideo = $("#aboutVideo");

  function setAboutVideoSource() {
    if (!aboutVideo) return;
    const isDark = document.body.classList.contains("dark");
    const newSrc = isDark ? "about-dark.mp4" : "about-light.mp4";
    const newPoster = isDark ? "about-dark.png" : "about-light.png";

    // set poster first to avoid showing blank
    aboutVideo.setAttribute("poster", newPoster);

    if (aboutVideo.getAttribute("src") !== newSrc) {
      aboutVideo.src = newSrc;
      aboutVideo.load();

      aboutVideo.addEventListener("loadeddata", () => {
        aboutVideo.currentTime = 0;
        aboutVideo.play().catch(() => {});
      }, { once: true });
    }
  }

  // ---------- DOMContentLoaded: wire everything once ----------
  document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const themeToggle = $("#themeToggle");
    const iconSun = $("#iconSun");
    const iconMoon = $("#iconMoon");

    const menuToggle = $("#menuToggle");
    const navMenu = $(".nav-links");
    const navLinks = $$(".nav-links li") || [];

    const sections = Array.from(document.querySelectorAll("section"));

    const toolkitContainer = document.querySelector(".toolkit-container");
    const toolkitToggleBtn = $("#toolkitToggle"); // the main toolkit center button (id)
    const toolkitBtnPreview = document.querySelector(".toolkit-btn"); // optional preview button that recenters
    const toolkitIcons = $$(".toolkit-icons button");
    const toolkitPages = $$(".toolkit-page");

    // Theme toggle: safe checks and image toggles
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        document.body.classList.toggle("light");

        if (iconSun && iconMoon) {
          if (document.body.classList.contains("dark")) {
            iconSun.style.display = "none";
            iconMoon.style.display = "block";
            themeToggle.setAttribute("title", "Light Mode");
          } else {
            iconSun.style.display = "block";
            iconMoon.style.display = "none";
            themeToggle.setAttribute("title", "Dark Mode");
          }
        }

        // Switch book images (safer with null checks)
        document.querySelectorAll(".book-pages .page").forEach(page => {
          const lightImg = page.querySelector(".light");
          const darkImg = page.querySelector(".dark");
          if (!lightImg || !darkImg) return;
          const isLight = document.body.classList.contains("light");
          lightImg.style.display = isLight ? "block" : "none";
          darkImg.style.display = isLight ? "none" : "block";
        });

        const coverLight = document.querySelector(".book-front .light");
        const coverDark = document.querySelector(".book-front .dark");
        if (coverLight && coverDark) {
          const isLight = document.body.classList.contains("light");
          coverLight.style.display = isLight ? "block" : "none";
          coverDark.style.display = isLight ? "none" : "block";
        }

        // update video source (use small timeout to allow classes/styles to settle)
        setTimeout(setAboutVideoSource, 70);
      });
    }

    // Run once on load to pick the right video
    setAboutVideoSource();

    // Hamburger menu
    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("show");
      });

      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("show");
          menuToggle.classList.remove("active");
        });
      });
    }

    // IntersectionObserver for active underline (and a scroll fallback)
    if (sections.length && navLinks.length) {
      const observerOptions = {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.target.id) return;
          if (entry.isIntersecting) {
            // remove active class first
            navLinks.forEach(link => link.classList.remove("active"));
            const anchor = document.querySelector(`.nav-links li a[href="#${entry.target.id}"]`);
            if (anchor && anchor.parentElement) anchor.parentElement.classList.add("active");
          }
        });
      }, observerOptions);

      sections.forEach(section => observer.observe(section));

      // Scroll fallback to handle situations where observer might not fire reliably
      window.addEventListener("scroll", () => {
        let current = "";
        const mid = window.innerHeight / 2;
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom >= mid) {
            current = section.getAttribute("id") || "";
          }
        });

        navLinks.forEach(link => link.classList.remove("active"));
        if (current) {
          const anchor = document.querySelector(`.nav-links li a[href="#${current}"]`);
          if (anchor && anchor.parentElement) anchor.parentElement.classList.add("active");
        }
      });
    }

    // Smooth scroll on nav click
    navLinks.forEach(li => {
      const anchor = li.querySelector("a");
      if (!anchor) return;
      anchor.addEventListener("click", e => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        const navEl = document.querySelector(".navbar");
        const navHeight = navEl ? navEl.offsetHeight : 0;
        const offset = targetSection.offsetTop - navHeight - 25;

        window.scrollTo({ top: offset, behavior: "smooth" });

        navLinks.forEach(l => l.classList.remove("active"));
        li.classList.add("active");
      });
    });

    // ---------- Toolkit: open/close pages & icons ----------
    let isAnimating = false;

    function scrollPageToIcon(icon, marginBottom = 200) {
      if (!icon) return;
      setTimeout(() => {
        const rect = icon.getBoundingClientRect();
        const scrollY = window.scrollY + rect.top - 190;
        const maxScroll = document.body.scrollHeight - window.innerHeight + marginBottom;
        window.scrollTo({ top: Math.min(scrollY, maxScroll), behavior: "smooth" });
      }, 5);
    }

    if (toolkitToggleBtn && toolkitContainer) {
      toolkitToggleBtn.addEventListener("click", () => {
        toolkitContainer.classList.toggle("active");
        toolkitToggleBtn.classList.toggle("active");

        const text = toolkitToggleBtn.querySelector(".view-more");
        if (text) {
          if (toolkitToggleBtn.classList.contains("active")) {
            text.textContent = "Click icons to explore";
          } else {
            text.textContent = "Click to view more";
          }
        }

        if (!toolkitContainer.classList.contains("active")) {
          toolkitPages.forEach(p => {
            p.classList.remove("active", "fullscreen");
            p.style.display = "none";
          });
          toolkitIcons.forEach(i => i.classList.remove("active"));
        } else {
          const activeIcon = document.querySelector(".toolkit-icons button.active");
          if (activeIcon) scrollPageToIcon(activeIcon);
        }
      });
    }

    // Small hover effect for central button (if present)
    const toolkitCenterBtn = toolkitToggleBtn;
    if (toolkitCenterBtn) {
      toolkitCenterBtn.addEventListener("mousemove", e => {
        const rect = toolkitCenterBtn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        toolkitCenterBtn.style.setProperty("--x", `${x}%`);
        toolkitCenterBtn.style.setProperty("--y", `${y}%`);
      });
    }

    // Toolkit icons open pages with robust transitions
    toolkitIcons.forEach(icon => {
      icon.addEventListener("click", async () => {
        if (isAnimating) return;
        isAnimating = true;

        const targetId = icon.getAttribute("data-page");
        const targetPage = targetId ? document.getElementById(targetId) : null;
        if (!targetPage) { isAnimating = false; return; }

        if (targetPage.classList.contains("active")) {
          isAnimating = false;
          return;
        }

        const currentPage = document.querySelector(".toolkit-page.active");
        if (currentPage) {
          currentPage.classList.remove("active");
          // force reflow then fade out
          void currentPage.offsetWidth;
          currentPage.classList.add("fade-out");
          await waitTransition(currentPage);
          currentPage.style.display = "none";
          currentPage.classList.remove("fade-out");
        }

        // show target page
        targetPage.style.display = "block";
        targetPage.classList.remove("fade-out", "left", "right");
        targetPage.style.transform = "";
        targetPage.style.opacity = "";

        void targetPage.offsetWidth;
        targetPage.classList.add("active");

        await waitTransition(targetPage);

        toolkitIcons.forEach(btn => btn.classList.remove("active"));
        icon.classList.add("active");

        scrollPageToIcon(icon);

        isAnimating = false;
      });
    });

    // Close buttons on pages with smooth transition
    $$(".close-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const page = btn.closest(".toolkit-page");
        if (!page) return;

        // Step 1: keep visible
        page.style.display = "block";

        // Step 2: trigger closing
        page.classList.add("closing");

        // Step 3: wait transition
        await waitTransition(page);

        // Step 4: cleanup
        page.classList.remove("active", "closing", "fullscreen");
        page.style.display = "none";

        // Step 5: un-highlight icon
        const pageId = page.getAttribute("id");
        const icon = $(`.toolkit-icons button[data-page="${pageId}"]`);
        if (icon) icon.classList.remove("active");
      });
    });

    // Optional preview toolkit re-center button
    if (toolkitBtnPreview) {
      toolkitBtnPreview.addEventListener("click", () => {
        const rect = toolkitBtnPreview.getBoundingClientRect();
        const offset = window.scrollY + rect.top;
        const centerY = window.innerHeight / 2 - rect.height / 2;
        window.scrollTo({ top: offset - centerY, behavior: "smooth" });
      });
    }

    // showPage utility (safe)
    window.showPage = (pageId) => {
      toolkitPages.forEach(page => {
        if (page.classList.contains("active")) {
          page.classList.remove("active");
          page.addEventListener("transitionend", function handler() {
            page.style.display = "none";
            page.removeEventListener("transitionend", handler);
          });
        }
      });
      const newPage = document.getElementById(pageId);
      if (!newPage) return;
      newPage.style.display = "block";
      requestAnimationFrame(() => newPage.classList.add("active"));
    };

    // ---------- Modal carousel / explanation (clean) ----------
    $$(".explore-btn").forEach(btn => {
      const modalId = btn.dataset.modal;
      const modal = modalId ? document.getElementById(modalId) : null;
      if (!modal) return;

      const closeBtn = modal.querySelector(".modal-close");
      const track = modal.querySelector(".carousel-track");
      if (!track) return;
      const slides = Array.from(track.children);
      const prevBtn = modal.querySelector(".carousel-btn.prev");
      const nextBtn = modal.querySelector(".carousel-btn.next");
      const infoBtn = modal.querySelector(".info-btn");
      const explanation = modal.querySelector(".explanation-card");

      let currentIndex = 0;
      const totalSlides = slides.length;

      const setupCarousel = () => {
        slides.forEach(slide => {
          slide.style.position = "absolute";
          slide.style.top = "0";
          slide.style.left = "50%";
          slide.style.transform = "translateX(-50%) scale(0.8)";
          slide.style.transition = "transform 0.5s ease, opacity 0.5s ease";
          slide.style.opacity = "0.5";
          slide.style.zIndex = "1";
        });
        updateCarousel();
      };

      const updateCarousel = () => {
        slides.forEach((slide, index) => {
          if (index === currentIndex) {
            slide.style.transform = "translateX(-50%) scale(1)";
            slide.style.opacity = "1";
            slide.style.zIndex = "3";
          } else if (index === (currentIndex - 1 + totalSlides) % totalSlides) {
            slide.style.transform = "translateX(-120%) scale(0.8)";
            slide.style.opacity = "0.6";
            slide.style.zIndex = "2";
          } else if (index === (currentIndex + 1) % totalSlides) {
            slide.style.transform = "translateX(20%) scale(0.8)";
            slide.style.opacity = "0.6";
            slide.style.zIndex = "2";
          } else {
            slide.style.transform = "translateX(-50%) scale(0.6)";
            slide.style.opacity = "0.3";
            slide.style.zIndex = "0";
          }
        });
        updateExplanation();
      };

      const updateExplanation = (direction = "right") => {
        const activeSlide = slides[currentIndex];
        const text = (activeSlide?.dataset?.explanation || "").replace(/\\n/g, "<br>");
        if (!explanation) return;
        explanation.innerHTML = ""; // clear previous content
        const newContent = document.createElement("div");
        newContent.className = `content enter-${direction}`;
        newContent.innerHTML = text;
        explanation.appendChild(newContent);
        requestAnimationFrame(() => newContent.classList.add("active"));
      };

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("closing"); // reset if it was closing
        modal.classList.add("active");
        setupCarousel();
        updateExplanation();
      });

            // Smooth close with scale reverse
      const closeModal = () => {
        modal.classList.add("closing");
        modal.classList.remove("active");
        modal.addEventListener("transitionend", function handler() {
          modal.classList.remove("closing");
          modal.removeEventListener("transitionend", handler);
        });
      };

      closeBtn?.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      prevBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
        updateExplanation("left");
      });

      nextBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
        updateExplanation("right");
      });

      infoBtn?.addEventListener("click", () => {
        explanation.classList.toggle("active");
      });
    });

    // Live buttons open new tab safely
    $$(".live-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.url;
        if (url) window.open(url, "_blank", "noopener");
      });
    });

    // Explanation bottom code removed — the carousel logic handles explanation now.

    // ---------- Video intersection observer ----------
    if (aboutVideo) {
      const vidObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            aboutVideo.play().catch(() => {});
          } else {
            aboutVideo.pause();
          }
        });
      }, { threshold: 0.5 });

      vidObserver.observe(aboutVideo);
    }

    // ---------- Contact form (single consolidated handler) ----------
    const form = $("#contactForm");
    const statusEl = $("#status");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="spinner"></span> Sending...`;
        }

        // Use your service/template IDs here - keep them consistent
        const SERVICE_ID = "service_lmyko7r";
        const TEMPLATE_ID = "template_nfr3omg";

        if (typeof emailjs === "undefined") {
          console.error("EmailJS not loaded");
          if (statusEl) {
            statusEl.textContent = "Email service unavailable.";
            statusEl.className = "show error";
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
          return;
        }

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
          .then(() => {
            if (statusEl) {
              statusEl.textContent = "Message sent! Thanks — I'll reply soon.";
              statusEl.className = "show success";
            }
            form.reset();
          }, (err) => {
            console.error("EmailJS error:", err);
            if (statusEl) {
              statusEl.textContent = "Failed to send. Please try again.";
              statusEl.className = "show error";
            }
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Send Message";
            }
          });
      });
    }

    // Initialize emailjs (public key)
    try {
      if (typeof emailjs !== "undefined" && emailjs.init) {
        emailjs.init("7v5aIkjkb7FKJc4qR");
      }
    } catch (e) {
      console.warn("EmailJS init failed", e);
    }

    // Footer observer (lazy reveal)
    const footer = $(".footer");
    if (footer) {
      const footerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) footer.classList.add("visible");
        });
      });
      footerObserver.observe(footer);
    }
  }); // end DOMContentLoaded
})();

