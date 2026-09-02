const roomPhotoButtons = [...document.querySelectorAll("[data-room-photo]")];
const roomLightbox = document.querySelector("#room-lightbox");
const track = roomLightbox.querySelector(".room-lightbox-track");
const closeButton = roomLightbox.querySelector(".room-lightbox-close");
const previousButton = roomLightbox.querySelector(
  ".room-gallery-arrow.previous",
);
const nextButton = roomLightbox.querySelector(".room-gallery-arrow.next");
const counter = roomLightbox.querySelector(".room-lightbox-counter");
let currentSlide = 0;
let scrollFrame;

roomPhotoButtons.forEach((button) => {
  const sourceImage = button.querySelector("img");
  const slide = document.createElement("figure");
  const image = sourceImage.cloneNode();
  const caption = document.createElement("figcaption");

  slide.className = "room-lightbox-slide";
  image.alt = sourceImage.alt;
  caption.textContent = button.dataset.roomName;
  slide.append(image, caption);
  track.appendChild(slide);
});

const updateCounter = () => {
  counter.textContent = `${currentSlide + 1} / ${roomPhotoButtons.length}`;
};

const showSlide = (index, behavior = "smooth") => {
  currentSlide = (index + roomPhotoButtons.length) % roomPhotoButtons.length;
  track.scrollTo({ left: currentSlide * track.clientWidth, behavior });
  updateCounter();
};

roomPhotoButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    roomLightbox.showModal();
    requestAnimationFrame(() => showSlide(index, "auto"));
  });
});

previousButton.addEventListener("click", () => showSlide(currentSlide - 1));
nextButton.addEventListener("click", () => showSlide(currentSlide + 1));
closeButton.addEventListener("click", () => roomLightbox.close());

roomLightbox.addEventListener("click", (event) => {
  if (
    !event.target.closest(
      ".room-lightbox-slide img, .room-lightbox-close, .room-gallery-arrow",
    )
  ) {
    roomLightbox.close();
  }
});

track.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const nextSlide = Math.round(track.scrollLeft / track.clientWidth);
      if (Number.isFinite(nextSlide) && nextSlide !== currentSlide) {
        currentSlide = nextSlide;
        updateCounter();
      }
    });
  },
  { passive: true },
);

roomLightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
  if (event.key === "ArrowRight") showSlide(currentSlide + 1);
});
