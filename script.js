// === Theme Toggle ===
const themeToggle = document.getElementById("themeToggle");
const iconSun = document.getElementById("iconSun");
const iconMoon = document.getElementById("iconMoon");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");

  if (document.body.classList.contains("dark")) {
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
    themeToggle.setAttribute("title", "Light Mode");
  } else {
    iconSun.style.display = "block";
    iconMoon.style.display = "none";
    themeToggle.setAttribute("title", "Dark Mode");
  }

  // Switch book images if book exists
  document.querySelectorAll(".book-pages .page").forEach(page => {
    const lightImg = page.querySelector(".light");
    const darkImg = page.querySelector(".dark");
    if (lightImg && darkImg) {
      if (document.body.classList.contains("light")) {
        lightImg.style.display = "block";
        darkImg.style.display = "none";
      } else {
        lightImg.style.display = "none";
        darkImg.style.display = "block";
      }
    }
  });

  // Also toggle book cover images
  const coverLight = document.querySelector(".book-front .light");
  const coverDark = document.querySelector(".book-front .dark");
  if (coverLight && coverDark) {
    if (document.body.classList.contains("light")) {
      coverLight.style.display = "block";
      coverDark.style.display = "none";
    } else {
      coverLight.style.display = "none";
      coverDark.style.display = "block";
    }
  }
});

// === Hamburger Menu ===
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = document.querySelectorAll(".nav-links li");

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

// === Sections & Active Underline ===
const sections = document.querySelectorAll("section");

const observerOptions = {
  root: null,
  rootMargin: "-50% 0px -50% 0px",
  threshold: 0
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute("id");
    navLinks.forEach(link => link.classList.remove("active"));
    if (entry.isIntersecting) {
      const activeLink = document.querySelector(`.nav-links li a[href="#${id}"]`).parentElement;
      activeLink.classList.add("active");
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// === Smooth Scroll on Click ===
navLinks.forEach(link => {
  const anchor = link.querySelector("a");
  anchor.addEventListener("click", e => {
    e.preventDefault();
    const targetId = anchor.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);

    targetSection.scrollIntoView({ behavior: "smooth" });

    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// === Toolkit Button & Icons ===
const toolkitContainer = document.querySelector('.toolkit-container');
const toolkitBtn = document.getElementById('toolkitToggle');
const toolkitIcons = document.querySelectorAll('.toolkit-icons a');
const toolkitPages = document.querySelectorAll('.toolkit-page'); 

toolkitBtn.addEventListener('click', () => {
  toolkitContainer.classList.toggle('active');
  toolkitBtn.classList.toggle('active');
});

const buttons = document.querySelectorAll(".toolkit-btn");
buttons.forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty("--x", `${x}%`);
    btn.style.setProperty("--y", `${y}%`);
  });

  btn.addEventListener("click", () => {
    const text = btn.querySelector(".view-more");
    if (btn.classList.contains("active")) {
      text.textContent = "Click icons";
    } else {
      text.textContent = "Click to View more";
    }
  });
});

toolkitIcons.forEach(icon => {
  icon.addEventListener('click', e => {
    e.preventDefault();
    const category = icon.getAttribute('title');

    toolkitIcons.forEach(ic => {
      const ind = ic.querySelector('.indicator');
      ind.style.opacity = '0';
      ind.style.top = '';
      ind.style.bottom = '';
      ind.style.left = '';
      ind.style.right = '';
      ind.style.transform = '';
    });

    const indicator = icon.querySelector('.indicator');
    const offsets = indicatorOffsets[category];
    Object.keys(offsets).forEach(key => {
      indicator.style[key] = offsets[key];
    });
    indicator.style.opacity = '1';

    toolkitPages.forEach(pg => pg.classList.remove('active'));
    const targetPage = document.getElementById(icon.dataset.page);
    if (targetPage) targetPage.classList.add('active');

    toolkitContainer.classList.add('active');
  });
});

// === Book Logic (Arithmetic) ===
const bookFront = document.getElementById("bookFront");
const bookPages = document.getElementById("bookPages");

bookFront.addEventListener("click", () => {
  // Hide cover
  bookFront.style.display = "none";
  // Show Table of Contents
  bookPages.style.display = "block";
});
