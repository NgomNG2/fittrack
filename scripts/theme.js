const THEME_KEY = "fittrack_theme";

export function setupThemeToggle() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);

  ["themeToggle", "themeToggleCollapsed", "themeToggleMobile"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        const isLight = document.body.classList.contains("light-theme");
        applyTheme(isLight ? "dark" : "light");
      });
    }
  });
}

function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem(THEME_KEY, theme);

  const icon = theme === "light" ? "☀️" : "🌙";
  const label = theme === "light" ? "Mode clair" : "Mode sombre";
  const iconEl = document.getElementById("themeToggleIcon");
  const labelEl = document.getElementById("themeToggleLabel");
  if (iconEl) iconEl.textContent = icon;
  if (labelEl) labelEl.textContent = label;
  const collapsedBtn = document.getElementById("themeToggleCollapsed");
  if (collapsedBtn) collapsedBtn.textContent = icon;
  const mobileBtn = document.getElementById("themeToggleMobile");
  if (mobileBtn) mobileBtn.textContent = icon;
}