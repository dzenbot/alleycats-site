const menuButton = document.querySelector(".menu");
const nav = document.querySelector("header nav");
if (menuButton && nav) {
  const setMenuState = (open) => {
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
    if (window.innerWidth > 1050) setMenuState(false);
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

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document
  .querySelectorAll('.original-header nav a[href$=".html"]')
  .forEach((link) => {
    const linkPage = new URL(link.href, window.location.href).pathname
      .split("/")
      .pop();
    link.classList.toggle(
      "is-current",
      currentPage !== "index.html" && linkPage === currentPage,
    );
  });
document
  .querySelectorAll("[data-year]")
  .forEach((el) => (el.textContent = new Date().getFullYear()));

const parallaxImages = [
  ...document.querySelectorAll(".original-hero>img,.replica-hero>img"),
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
