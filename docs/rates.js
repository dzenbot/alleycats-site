const roomGallery = new window.AlleyCatsGallery();

document.querySelectorAll("[data-room-photo]").forEach((button) => {
  button.addEventListener("click", () => {
    const images = button.dataset.gallery.split(/\s+/).filter(Boolean);
    const roomName = button.dataset.roomName;

    roomGallery.open({
      title: roomName,
      images,
      altTexts: images.map((_, index) => `${roomName}, photo ${index + 1}`),
    });
  });
});
