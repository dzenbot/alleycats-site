(() => {
  const storageKey = "alley-cats-theme";
  const validThemes = new Set(["light", "dark"]);

  const readSavedTheme = () => {
    try {
      const savedTheme = window.localStorage.getItem(storageKey);
      return validThemes.has(savedTheme) ? savedTheme : null;
    } catch {
      return null;
    }
  };

  const colorSchemePreference = window.matchMedia(
    "(prefers-color-scheme: dark)",
  );
  const preferredTheme = () =>
    colorSchemePreference.matches ? "dark" : "light";

  const saveTheme = (theme) => {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  };

  const applyTheme = (theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const logo = document.querySelector(".original-logo img");
    if (logo) {
      logo.src = theme === "dark" ? "images/logo-lite.png" : "images/logo.png";
    }

    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      const darkMode = theme === "dark";
      toggle.setAttribute("aria-pressed", String(darkMode));
      toggle.setAttribute(
        "aria-label",
        darkMode ? "Switch to light mode" : "Switch to dark mode",
      );
      toggle.title = darkMode ? "Light mode" : "Dark mode";
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = theme === "dark" ? "#0b3f5b" : "#ffffff";
    }

    if (persist) saveTheme(theme);
  };

  const savedTheme = readSavedTheme();
  let hasExplicitTheme = savedTheme !== null;
  const initialTheme = savedTheme || preferredTheme();
  applyTheme(initialTheme);

  colorSchemePreference.addEventListener("change", (event) => {
    if (!hasExplicitTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const bookButton = document.querySelector(
      ".original-header nav > .original-button",
    );

    if (bookButton && !document.querySelector("[data-theme-toggle]")) {
      const toggle = document.createElement("button");
      toggle.className = "theme-toggle";
      toggle.type = "button";
      toggle.dataset.themeToggle = "";
      toggle.innerHTML = `
        <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"></path>
        </svg>
        <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.75"></circle>
          <path d="M12 2v2.25M12 19.75V22M4.93 4.93l1.59 1.59M17.48 17.48l1.59 1.59M2 12h2.25M19.75 12H22M4.93 19.07l1.59-1.59M17.48 6.52l1.59-1.59"></path>
        </svg>`;
      bookButton.insertAdjacentElement("afterend", toggle);

      toggle.addEventListener("click", () => {
        const nextTheme =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        hasExplicitTheme = true;
        applyTheme(nextTheme, true);
      });
    }

    applyTheme(document.documentElement.dataset.theme || initialTheme);
  });
})();
