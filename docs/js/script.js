const headerFrame = document.querySelector(".site-header-frame");
window.addEventListener("message", (event) => {
  if (
    !headerFrame ||
    event.source !== headerFrame.contentWindow ||
    event.origin !== window.location.origin ||
    event.data?.type !== "alley-cats-header-menu"
  )
    return;

  const open = Boolean(event.data.open);
  headerFrame.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("menu-open", open);
});

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
  "new-customer.html",
]);
const requestedFile = window.location.pathname.split("/").pop();

if (
  /^https?:$/.test(window.location.protocol) &&
  cleanUrlPages.has(requestedFile)
) {
  const cleanPath = window.location.pathname.slice(0, -requestedFile.length);
  const pagePath =
    requestedFile === "index.html" ? "" : requestedFile.slice(0, -5);
  window.history.replaceState(
    null,
    "",
    `${cleanPath}${pagePath}${window.location.search}${window.location.hash}`,
  );
}

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
