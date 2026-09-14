class AlleyCatsGallery {
  constructor() {
    this.photos = [];
    this.altTexts = [];
    this.title = "";
    this.currentIndex = 0;
    this.activeImageIndex = 0;
    this.transitionToken = 0;
    this.touchStartX = 0;
    this.suppressOverlayClick = false;
    this.closeTimer = null;
    this.themeColor = document.querySelector('meta[name="theme-color"]');
    this.originalThemeColor = this.themeColor?.content || "#ffffff";

    this.build();
    this.bindEvents();
  }

  build() {
    this.overlay = document.createElement("div");
    this.overlay.className = "gallery-overlay";
    this.overlay.hidden = true;
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.setAttribute("aria-label", "Photo gallery");

    this.closeButton = this.createButton(
      "gallery-close",
      "Close photo gallery",
      2,
    );
    this.previousButton = this.createButton(
      "gallery-arrow gallery-previous",
      "Previous photo",
      1,
    );
    this.nextButton = this.createButton(
      "gallery-arrow gallery-next",
      "Next photo",
      1,
    );

    this.track = document.createElement("div");
    this.track.className = "gallery-track";
    this.track.tabIndex = 0;

    this.slide = document.createElement("figure");
    this.slide.className = "gallery-slide";
    this.heading = document.createElement("div");
    this.heading.className = "gallery-heading";
    this.caption = document.createElement("figcaption");
    this.imageStage = document.createElement("div");
    this.imageStage.className = "gallery-image-stage";
    this.galleryImages = [
      document.createElement("img"),
      document.createElement("img"),
    ];

    this.galleryImages.forEach((image) => {
      image.draggable = false;
      this.imageStage.appendChild(image);
    });

    this.heading.appendChild(this.caption);
    this.slide.append(this.heading, this.imageStage);
    this.track.appendChild(this.slide);

    this.counter = document.createElement("p");
    this.counter.className = "gallery-counter";
    this.counter.setAttribute("aria-live", "polite");

    this.controls = document.createElement("div");
    this.controls.className = "gallery-controls";
    this.controls.append(this.previousButton, this.counter, this.nextButton);
    this.overlay.append(this.closeButton, this.track, this.controls);
    document.body.appendChild(this.overlay);
  }

  createButton(className, label, lineCount) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.setAttribute("aria-label", label);

    for (let index = 0; index < lineCount; index += 1) {
      const line = document.createElement("span");
      line.setAttribute("aria-hidden", "true");
      button.appendChild(line);
    }

    return button;
  }

  bindEvents() {
    this.previousButton.addEventListener("click", () =>
      this.show(this.currentIndex - 1),
    );
    this.nextButton.addEventListener("click", () =>
      this.show(this.currentIndex + 1),
    );
    this.closeButton.addEventListener("click", () => this.close());

    this.overlay.addEventListener("click", (event) => {
      if (this.suppressOverlayClick) return;
      if (!event.target.closest(".gallery-close, .gallery-arrow")) this.close();
    });

    this.imageStage.addEventListener("contextmenu", (event) =>
      event.preventDefault(),
    );
    this.imageStage.addEventListener("dragstart", (event) =>
      event.preventDefault(),
    );

    this.track.addEventListener(
      "touchstart",
      (event) => {
        this.touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true },
    );

    this.track.addEventListener(
      "touchend",
      (event) => {
        const distance = event.changedTouches[0].clientX - this.touchStartX;
        if (Math.abs(distance) < 45 || this.photos.length < 2) return;

        this.suppressOverlayClick = true;
        this.show(this.currentIndex + (distance < 0 ? 1 : -1));
        window.setTimeout(() => {
          this.suppressOverlayClick = false;
        }, 0);
      },
      { passive: true },
    );

    this.overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.close();
      if (event.key === "ArrowLeft") this.show(this.currentIndex - 1);
      if (event.key === "ArrowRight") this.show(this.currentIndex + 1);
    });
  }

  open({ title = "", images, altTexts = [], initialIndex = 0 }) {
    if (!Array.isArray(images) || images.length === 0) return;

    this.photos = images;
    this.altTexts = altTexts;
    this.title = title;
    this.currentIndex = Math.min(Math.max(initialIndex, 0), images.length - 1);
    this.previouslyFocused = document.activeElement;
    this.overlay.classList.remove("is-closing");
    this.overlay.hidden = false;
    this.overlay.style.setProperty("--gallery-page-top", `${window.scrollY}px`);
    this.setInitialImage();

    if (this.themeColor) this.themeColor.content = "#202020";
    document.documentElement.classList.add("gallery-open");
    document.body.classList.add("gallery-open");
    this.overlay.classList.add("is-open");
    this.closeButton.focus({ preventScroll: true });
  }

  close() {
    if (this.overlay.hidden || this.overlay.classList.contains("is-closing"))
      return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.finishClosing();
      return;
    }

    this.overlay.classList.add("is-closing");
    window.clearTimeout(this.closeTimer);
    this.closeTimer = window.setTimeout(() => this.finishClosing(), 280);
  }

  finishClosing() {
    this.overlay.classList.remove("is-open", "is-closing");
    this.overlay.hidden = true;
    if (this.themeColor) this.themeColor.content = this.originalThemeColor;
    document.documentElement.classList.remove("gallery-open");
    document.body.classList.remove("gallery-open");
    this.previouslyFocused?.focus({ preventScroll: true });
  }

  updateDetails() {
    this.caption.textContent = this.title;
    this.counter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
    const showArrows = this.photos.length > 1;
    this.previousButton.hidden = !showArrows;
    this.nextButton.hidden = !showArrows;
  }

  getAltText(index) {
    return (
      this.altTexts[index] || `${this.title || "Gallery"}, photo ${index + 1}`
    );
  }

  markOrientation(image) {
    const isPortrait = image.naturalHeight > image.naturalWidth;
    image.classList.toggle("is-portrait", isPortrait);
    this.imageStage.classList.toggle("is-portrait", isPortrait);
  }

  setInitialImage() {
    this.transitionToken += 1;
    this.activeImageIndex = 0;
    this.galleryImages.forEach((image) => image.classList.remove("is-active"));
    const image = this.galleryImages[this.activeImageIndex];
    image.onload = () => this.markOrientation(image);
    image.src = this.photos[this.currentIndex];
    image.alt = this.getAltText(this.currentIndex);
    if (image.complete) this.markOrientation(image);
    image.classList.add("is-active");
    this.updateDetails();
  }

  show(index, immediate = false) {
    this.currentIndex = (index + this.photos.length) % this.photos.length;
    const token = ++this.transitionToken;
    const outgoingImage = this.galleryImages[this.activeImageIndex];
    const incomingIndex = this.activeImageIndex === 0 ? 1 : 0;
    const incomingImage = this.galleryImages[incomingIndex];

    incomingImage.classList.remove("is-active");
    incomingImage.src = this.photos[this.currentIndex];
    incomingImage.alt = this.getAltText(this.currentIndex);
    this.updateDetails();

    if (
      immediate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.markOrientation(incomingImage);
      outgoingImage.classList.remove("is-active");
      incomingImage.classList.add("is-active");
      this.activeImageIndex = incomingIndex;
      return;
    }

    const revealImage = () => {
      if (token !== this.transitionToken) return;
      this.markOrientation(incomingImage);
      requestAnimationFrame(() => {
        incomingImage.classList.add("is-active");
        outgoingImage.classList.remove("is-active");
        this.activeImageIndex = incomingIndex;
      });
    };

    if (incomingImage.complete) revealImage();
    else incomingImage.addEventListener("load", revealImage, { once: true });
  }
}

window.AlleyCatsGallery = AlleyCatsGallery;
