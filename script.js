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
}

const contactSuccess = document.getElementById("contact-success");
if (contactSuccess) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("contact") === "sent") {
    contactSuccess.hidden = false;
    const cleanUrl = `${window.location.pathname}#contact`;
    window.history.replaceState(null, "", cleanUrl);
  }
}
