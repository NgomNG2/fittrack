import { setupNav } from "./navigation.js";
import { setupModals } from "./modals.js";
import { setupSidebarToggle } from "./sidebar.js";
import { setupThemeToggle } from "./theme.js";
import { setupWorkoutFormEvents, setupExportButtons } from "./workouts.js";
import { setupGoalFormEvents } from "./goals.js";
import { setupWeightFormEvents, setupPeriodToggle } from "./progress.js";
import { loadAll } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupModals();
  setupWorkoutFormEvents();
  setupGoalFormEvents();
  setupWeightFormEvents();
  setupExportButtons();
  setupPeriodToggle();
  setupSidebarToggle();
  setupThemeToggle();
  loadAll();
});