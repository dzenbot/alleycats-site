const menuButton = document.querySelector(".menu");
const nav = document.querySelector("header nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", open);
  });
}
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
