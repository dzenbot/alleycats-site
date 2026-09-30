const cameraRoomSelect = document.querySelector("#camera-room");
const cameraCredentials = document.querySelector("#camera-credentials");
const cameraCredentialsPanel = document.querySelector(
  "#camera-credentials-panel",
);
const cameraExpandButton = document.querySelector("#camera-credentials-expand");
const cameraActions = document.querySelectorAll(".camera-action");

const setCredentialsExpanded = (expanded) => {
  cameraCredentialsPanel.classList.toggle("is-expanded", expanded);
  cameraExpandButton.setAttribute("aria-expanded", String(expanded));
  cameraExpandButton.setAttribute(
    "aria-label",
    expanded ? "Close expanded credentials" : "Expand credentials",
  );
  document.body.classList.toggle("credentials-expanded", expanded);
};

cameraExpandButton.addEventListener("click", () => {
  setCredentialsExpanded(
    !cameraCredentialsPanel.classList.contains("is-expanded"),
  );
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setCredentialsExpanded(false);
});

cameraActions.forEach((action) => {
  if (typeof action.animate !== "function") return;
  let actionAnimation;

  const animateAction = (nextScale) => {
    const currentTransform = getComputedStyle(action).transform;
    actionAnimation?.cancel();
    actionAnimation = action.animate(
      [
        {
          transform:
            currentTransform === "none"
              ? "translateZ(0) scale(1)"
              : currentTransform,
        },
        { transform: `translateZ(0) scale(${nextScale})` },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "forwards",
      },
    );
  };

  action.addEventListener("pointerenter", () => animateAction(1.025));
  action.addEventListener("pointerleave", () => animateAction(1));
});

const showCameraMessage = (message) => {
  cameraCredentials.textContent = "";
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  cameraCredentials.appendChild(paragraph);
};

fetch("data/camera-credentials.json")
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
        setCredentialsExpanded(false);
        cameraExpandButton.hidden = true;
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
      cameraExpandButton.hidden = false;
    });
  })
  .catch(() => {
    setCredentialsExpanded(false);
    cameraExpandButton.hidden = true;
    showCameraMessage(
      "Camera details are temporarily unavailable. Please contact our staff.",
    );
  });
