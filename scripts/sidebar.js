const SIDEBAR_KEY = "fittrack_sidebar_collapsed";

export function setupSidebarToggle() {
  const collapsed = localStorage.getItem(SIDEBAR_KEY) === "1";
  applySidebarState(collapsed);

  document.getElementById("sidebarToggle").addEventListener("click", () => applySidebarState(true));
  document.getElementById("sidebarOpenBtn").addEventListener("click", () => applySidebarState(false));
}

function applySidebarState(collapsed) {
  document.body.classList.toggle("sidebar-hidden", collapsed);
  localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
}