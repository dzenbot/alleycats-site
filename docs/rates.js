const roomPhotoButtons = [...document.querySelectorAll("[data-room-photo]")];
const roomLightbox = document.querySelector("#room-lightbox");
const track = roomLightbox.querySelector(".room-lightbox-track");
const closeButton = roomLightbox.querySelector(".room-lightbox-close");
const previousButton = roomLightbox.querySelector(
  ".room-gallery-arrow.previous",
);
const nextButton = roomLightbox.querySelector(".room-gallery-arrow.next");
const counter = roomLightbox.querySelector(".room-lightbox-counter");
const themeColor = document.querySelector("#page-theme-color");
const slide = document.createElement("figure");
const caption = document.createElement("figcaption");
const galleryHeading = document.createElement("div");
const imageStage = document.createElement("div");
const galleryImages = [
  document.createElement("img"),
  document.createElement("img"),
];
let currentPhotos = [];
let currentRoomName = "";
let currentSlide = 0;
let activeImage = 0;
let transitionToken = 0;
let closeTimer;
let touchStartX = 0;
let suppressOverlayClick = false;

slide.className = "room-lightbox-slide";
galleryHeading.className = "room-lightbox-heading";
imageStage.className = "room-lightbox-image-stage";
galleryImages.forEach((image) => {
  image.draggable = false;
  imageStage.appendChild(image);
});
galleryHeading.append(caption, closeButton);
slide.append(galleryHeading, imageStage);
track.appendChild(slide);

const updateGalleryDetails = () => {
  caption.textContent = currentRoomName;
  counter.textContent = `${currentSlide + 1} / ${currentPhotos.length}`;

  const hasMultiplePhotos = currentPhotos.length > 1;
  previousButton.hidden = !hasMultiplePhotos;
  nextButton.hidden = !hasMultiplePhotos;
};

const markImageOrientation = (image) => {
  const isPortrait = image.naturalHeight > image.naturalWidth;
  image.classList.toggle("is-portrait", isPortrait);
  imageStage.classList.toggle("is-portrait", isPortrait);
  roomLightbox.classList.toggle("is-portrait", isPortrait);
};

const setInitialImage = () => {
  transitionToken += 1;
  activeImage = 0;
  galleryImages.forEach((image) => image.classList.remove("is-active"));
  const image = galleryImages[activeImage];
  image.onload = () => markImageOrientation(image);
  image.src = currentPhotos[currentSlide];
  image.alt = `${currentRoomName}, photo ${currentSlide + 1}`;
  if (image.complete) markImageOrientation(image);
  image.classList.add("is-active");
  updateGalleryDetails();
};

const showSlide = (index, immediate = false) => {
  currentSlide = (index + currentPhotos.length) % currentPhotos.length;
  const token = ++transitionToken;
  const outgoingImage = galleryImages[activeImage];
  const incomingIndex = activeImage === 0 ? 1 : 0;
  const incomingImage = galleryImages[incomingIndex];

  incomingImage.classList.remove("is-active");
  incomingImage.src = currentPhotos[currentSlide];
  incomingImage.alt = `${currentRoomName}, photo ${currentSlide + 1}`;
  updateGalleryDetails();

  if (
    immediate ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    markImageOrientation(incomingImage);
    outgoingImage.classList.remove("is-active");
    incomingImage.classList.add("is-active");
    activeImage = incomingIndex;
    return;
  }

  const revealImage = () => {
    if (token !== transitionToken) return;
    markImageOrientation(incomingImage);
    requestAnimationFrame(() => {
      incomingImage.classList.add("is-active");
      outgoingImage.classList.remove("is-active");
      activeImage = incomingIndex;
    });
  };

  if (incomingImage.complete) revealImage();
  else incomingImage.addEventListener("load", revealImage, { once: true });
};

const closeGallery = () => {
  if (roomLightbox.hidden || roomLightbox.classList.contains("is-closing"))
    return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    roomLightbox.classList.remove("is-open");
    roomLightbox.hidden = true;
    themeColor.content = "#ffffff";
    document.documentElement.classList.remove("room-gallery-open");
    document.body.classList.remove("room-gallery-open");
    return;
  }

  roomLightbox.classList.add("is-closing");
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    roomLightbox.classList.remove("is-open", "is-closing");
    roomLightbox.hidden = true;
    themeColor.content = "#ffffff";
    document.documentElement.classList.remove("room-gallery-open");
    document.body.classList.remove("room-gallery-open");
  }, 280);
};

roomPhotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPhotos = button.dataset.gallery.split(/\s+/).filter(Boolean);
    currentRoomName = button.dataset.roomName;
    currentSlide = 0;
    roomLightbox.classList.remove("is-closing");
    roomLightbox.hidden = false;
    roomLightbox.style.setProperty("--gallery-page-top", `${window.scrollY}px`);
    setInitialImage();
    themeColor.content = "#202020";
    document.documentElement.classList.add("room-gallery-open");
    document.body.classList.add("room-gallery-open");
    roomLightbox.classList.add("is-open");
    closeButton.focus({ preventScroll: true });
  });
});

previousButton.addEventListener("click", () => showSlide(currentSlide - 1));
nextButton.addEventListener("click", () => showSlide(currentSlide + 1));
closeButton.addEventListener("click", closeGallery);

roomLightbox.addEventListener("click", (event) => {
  if (suppressOverlayClick) return;
  if (!event.target.closest(".room-lightbox-close, .room-gallery-arrow")) {
    closeGallery();
  }
});

imageStage.addEventListener("contextmenu", (event) => event.preventDefault());
imageStage.addEventListener("dragstart", (event) => event.preventDefault());

track.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true },
);

track.addEventListener(
  "touchend",
  (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45 || currentPhotos.length < 2) return;
    suppressOverlayClick = true;
    showSlide(currentSlide + (distance < 0 ? 1 : -1));
    window.setTimeout(() => {
      suppressOverlayClick = false;
    }, 0);
  },
  { passive: true },
);

roomLightbox.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
  if (event.key === "ArrowRight") showSlide(currentSlide + 1);
});
