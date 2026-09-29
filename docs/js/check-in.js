(() => {
  const storageKey = "alley-cats-check-in";
  const items = [...document.querySelectorAll("[data-check-in-item]")];
  const count = document.querySelector("[data-check-in-count]");
  const progress = document.querySelector("[data-check-in-progress]");
  const progressbar = document.querySelector("[role='progressbar']");
  const reset = document.querySelector("[data-check-in-reset]");
  const finish = document.querySelector("[data-check-in-finish]");
  const waiverAction = document.querySelector(
    '.check-in-action[href="https://waiver.fr/p-Cr7pX"]',
  );
  const waiverItem = document.querySelector("#check-in-waiver");
  const installAction = document.querySelector(
    '.check-in-action[href="hikconnect.html"]',
  );
  const installItem = document.querySelector("#check-in-app");

  const readState = () => {
    try {
      const state = JSON.parse(localStorage.getItem(storageKey));
      return state && typeof state === "object" ? state : {};
    } catch {
      return {};
    }
  };

  const saveState = () => {
    const state = Object.fromEntries(
      items.map((item) => [item.id, item.checked]),
    );
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // The checklist remains usable when local storage is unavailable.
    }
  };

  const render = () => {
    const completed = items.filter((item) => item.checked).length;
    const percentage = items.length ? (completed / items.length) * 100 : 0;

    items.forEach((item) => {
      item.closest("li")?.classList.toggle("is-complete", item.checked);
    });
    count.textContent = `${completed} of ${items.length} ready`;
    progress.style.setProperty("--check-in-progress", `${percentage}%`);
    progressbar.setAttribute("aria-valuenow", String(completed));
    reset.hidden = completed === 0;
    finish.textContent =
      completed === items.length
        ? "You're ready for check-in!"
        : "You're almost ready.";
  };

  const state = readState();
  items.forEach((item) => {
    item.checked = Boolean(state[item.id]);
    item.addEventListener("change", () => {
      saveState();
      render();
    });
  });

  reset.addEventListener("click", () => {
    items.forEach((item) => {
      item.checked = false;
    });
    saveState();
    render();
  });

  const completeAfterOpening = (action, item) => {
    action?.addEventListener("click", () => {
      window.setTimeout(() => {
        if (!item || item.checked) return;
        item.checked = true;
        saveState();
        render();
      }, 1400);
    });
  };

  completeAfterOpening(waiverAction, waiverItem);
  completeAfterOpening(installAction, installItem);

  document.querySelectorAll(".check-in-action").forEach((action) => {
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

  render();
})();
