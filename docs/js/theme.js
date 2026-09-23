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
      logo.src = theme === "dark" ? "img/logo-lite.png" : "img/logo.png";
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

  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey) return;
    const updatedTheme = readSavedTheme();
    hasExplicitTheme = updatedTheme !== null;
    applyTheme(updatedTheme || preferredTheme());
  });

  window.addEventListener("DOMContentLoaded", () => {
    applyTheme(document.documentElement.dataset.theme || initialTheme);
  });
})();
