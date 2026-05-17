"use strict";

const yearEl = document.getElementById("current-year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.getElementById("primary-nav");

function setNavOpen(open) {
  if (!header || !navToggle) return;
  header.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle.querySelector(".visually-hidden").textContent = open
    ? "Close menu"
    : "Open menu";
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.contains("nav-open");
    setNavOpen(!isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      header.classList.contains("nav-open") &&
      !header.contains(event.target)
    ) {
      setNavOpen(false);
    }
  });
}

const navLinks = document.querySelectorAll("[data-nav]");
const sections = document.querySelectorAll("[data-section]");

function setActiveNav(id) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.nav === id;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (navLinks.length && sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        setActiveNav(visible[0].target.dataset.section);
      }
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0, 0.25, 0.5],
    },
  );

  sections.forEach((section) => observer.observe(section));
} else if (navLinks.length) {
  setActiveNav("about");
}

const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const contactSuccess = document.getElementById("contact-success");
const contactError = document.getElementById("contact-error");

function showContactMessage(type) {
  if (contactSuccess) contactSuccess.hidden = type !== "success";
  if (contactError) contactError.hidden = type !== "error";
}

if (contactForm && contactSubmit) {
  const defaultLabel = contactSubmit.textContent;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showContactMessage(null);

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Sending…";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();

      if (result.success) {
        contactForm.reset();
        showContactMessage("success");
        const cleanUrl = `${window.location.pathname}#contact`;
        window.history.replaceState(null, "", cleanUrl);
      } else {
        showContactMessage("error");
      }
    } catch {
      showContactMessage("error");
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = defaultLabel;
    }
  });
}

const params = new URLSearchParams(window.location.search);
if (params.get("contact") === "sent") {
  showContactMessage("success");
  const cleanUrl = `${window.location.pathname}#contact`;
  window.history.replaceState(null, "", cleanUrl);
}
