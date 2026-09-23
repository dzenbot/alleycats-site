(() => {
  const storageKey = "alley-cats-theme";
  const compactQuery = matchMedia("(max-width: 1180px)");
  const colorQuery = matchMedia("(prefers-color-scheme: dark)");
  const nav = document.querySelector("nav");
  const menu = document.querySelector(".menu");
  const toggle = document.querySelector("[data-theme-toggle]");
  let closeTimer;

  const readTheme = () => {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  let explicitTheme = readTheme() !== null;
  const applyTheme = (theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const dark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
    toggle.title = dark ? "Light mode" : "Dark mode";
    if (persist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {}
    }
  };

  applyTheme(readTheme() || (colorQuery.matches ? "dark" : "light"));

  toggle.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    explicitTheme = true;
    applyTheme(next, true);
  });
  addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      explicitTheme = readTheme() !== null;
      applyTheme(readTheme() || (colorQuery.matches ? "dark" : "light"));
    }
  });
  colorQuery.addEventListener("change", (event) => {
    if (!explicitTheme) applyTheme(event.matches ? "dark" : "light");
  });

  const notifyParent = (open) =>
    parent.postMessage({ type: "alley-cats-header-menu", open }, "*");
  const setMenu = (open) => {
    clearTimeout(closeTimer);
    if (open) {
      nav.classList.remove("is-closing");
      nav.classList.add("open");
      menu.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-label", "Close menu");
      notifyParent(true);
      return;
    }
    if (!nav.classList.contains("open")) {
      notifyParent(false);
      return;
    }
    nav.classList.remove("open");
    nav.classList.add("is-closing");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open menu");
    closeTimer = setTimeout(() => {
      nav.classList.remove("is-closing");
      notifyParent(false);
    }, 280);
  };

  menu.addEventListener("click", () =>
    setMenu(!nav.classList.contains("open")),
  );
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  compactQuery.addEventListener("change", (event) => {
    if (!event.matches) setMenu(false);
  });

  let pathname = "";
  try {
    pathname = parent.location.pathname;
  } catch {
    pathname = document.referrer ? new URL(document.referrer).pathname : "";
  }
  const current =
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/\.html$/, "") || "index";
  nav.querySelectorAll("a:not(.book-button)").forEach((link) => {
    const page = new URL(link.href).pathname
      .split("/")
      .pop()
      .replace(/\.html$/, "");
    link.classList.toggle(
      "is-current",
      current !== "index" && current === page,
    );
  });
})();
