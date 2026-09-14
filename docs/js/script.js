const menuButton = document.querySelector(".menu");
const nav = document.querySelector("header nav");
if (menuButton && nav) {
  let menuCloseTimer;

  const setMenuState = (open) => {
    const wasOpen = nav.classList.contains("open");

    window.clearTimeout(menuCloseTimer);
    nav.classList.remove("is-closing");

    if (!open && wasOpen) {
      nav.classList.add("is-closing");
      menuCloseTimer = window.setTimeout(() => {
        nav.classList.remove("is-closing");
      }, 280);
    }

    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuButton.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) setMenuState(false);
  });
}

const preventPageZoom = (event) => event.preventDefault();

document.addEventListener("gesturestart", preventPageZoom, { passive: false });
document.addEventListener("gesturechange", preventPageZoom, { passive: false });
document.addEventListener("gestureend", preventPageZoom, { passive: false });
document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 1) event.preventDefault();
  },
  { passive: false },
);
document.addEventListener("dblclick", preventPageZoom, { passive: false });

const cleanUrlPages = new Set([
  "index.html",
  "rates.html",
  "guidelines.html",
  "about.html",
  "cameras.html",
]);
const requestedFile = window.location.pathname.split("/").pop();

if (
  /^https?:$/.test(window.location.protocol) &&
  cleanUrlPages.has(requestedFile)
) {
  const cleanPath = window.location.pathname.slice(0, -requestedFile.length);
  const pagePath = requestedFile === "index.html" ? "" : requestedFile.slice(0, -5);
  window.history.replaceState(
    null,
    "",
    `${cleanPath}${pagePath}${window.location.search}${window.location.hash}`,
  );
}

const currentPage = window.location.pathname.split("/").pop() || "index";
document
  .querySelectorAll(".original-header nav a:not(.original-button)")
  .forEach((link) => {
    const linkPage = new URL(link.href, window.location.href).pathname
      .split("/")
      .pop()
      .replace(/\.html$/, "");
    link.classList.toggle(
      "is-current",
      currentPage !== "index" && linkPage === currentPage,
    );
  });
document
  .querySelectorAll("[data-year]")
  .forEach((el) => (el.textContent = new Date().getFullYear()));

const parallaxImages = [
  ...document.querySelectorAll(
    ".original-hero>img,.replica-hero>img,[data-parallax]",
  ),
];
if (
  parallaxImages.length &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  let parallaxFrame;
  const updateParallax = () => {
    parallaxFrame = undefined;
    parallaxImages.forEach((image) => {
      const hero = image.parentElement;
      const rect = hero.getBoundingClientRect();
      const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
      const offset = Math.max(-45, Math.min(45, distance * 0.08));
      image.style.setProperty("--parallax-offset", `${offset}px`);
    });
  };
  const requestParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
  };
  updateParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
}
