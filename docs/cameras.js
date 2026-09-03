const cameraRoomSelect = document.querySelector("#camera-room");
const cameraCredentials = document.querySelector("#camera-credentials");

const showCameraMessage = (message) => {
  cameraCredentials.textContent = "";
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  cameraCredentials.appendChild(paragraph);
};

fetch("camera-credentials.json")
  .then((response) => {
    if (!response.ok) throw new Error("Camera details could not be loaded");
    return response.json();
  })
  .then(({ rooms }) => {
    rooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.value;
      option.textContent = room.label;
      cameraRoomSelect.appendChild(option);
    });

    cameraRoomSelect.addEventListener("change", () => {
      const room = rooms.find((item) => item.value === cameraRoomSelect.value);
      if (!room) {
        cameraCredentials.textContent = "";
        return;
      }

      cameraCredentials.textContent = "";
      const fields = [
        ["Adding Type", room.addingType],
        ["Alias", room.alias],
        ["Address", room.address],
        ["Port", room.port],
        ["User Name", room.username],
        ["Password", room.password],
      ];
      fields.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        paragraph.append(strong, value);
        cameraCredentials.appendChild(paragraph);
      });
    });
  })
  .catch(() => {
    showCameraMessage(
      "Camera details are temporarily unavailable. Please contact our staff.",
    );
  });
