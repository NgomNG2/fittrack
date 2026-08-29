import { state } from "./core.js";
import { loadAll } from "./data.js";
import { renderProgressChart } from "./progress.js";
import { renderDashboard } from "./dashboard.js";

export function setupNav() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
  document.getElementById("mobileNav").addEventListener("change", (e) => {
    switchView(e.target.value);
  });
  document.getElementById("refreshDash").addEventListener("click", loadAll);
}

export function switchView(view) {
  state.currentView = view;
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.getElementById("mobileNav").value = view;
  if (view === "progress") renderProgressChart();
  if (view === "dashboard") renderDashboard();
}