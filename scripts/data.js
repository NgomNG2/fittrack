import { state } from "./core.js";
import { API_URL, apiGet } from "./api.js";
import { toast } from "./toast.js";
import { populateMuscleFilter, renderExercises } from "./exercises.js";
import { renderWorkouts, populateTemplateSelect } from "./workouts.js";
import { renderGoals } from "./goals.js";
import { renderWeightHistory, populateCompareSelect } from "./progress.js";
import { renderDashboard } from "./dashboard.js";

export async function loadAll() {
  try {
    const [exercises, workouts, goals, weightHistory, templates] = await Promise.all([
      apiGet("/exercises"),
      apiGet("/workouts"),
      apiGet("/goals"),
      apiGet("/weightHistory"),
      apiGet("/workoutTemplates"),
    ]);
    state.exercises = exercises;
    state.workouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    state.goals = goals;
    state.weightHistory = weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    state.templates = templates;

    setApiStatus(true);
    populateMuscleFilter();
    populateTemplateSelect();
    renderExercises();
    renderWorkouts();
    renderGoals();
    renderWeightHistory();
    renderDashboard();
    populateCompareSelect();
  } catch (err) {
    console.error(err);
    setApiStatus(false);
    toast("Impossible de joindre json-server sur " + API_URL, true);
  }
}

export function setApiStatus(ok) {
  const dot = document.getElementById("apiStatus");
  const label = document.getElementById("apiStatusLabel");
  dot.classList.toggle("ok", ok);
  dot.classList.toggle("err", !ok);
  label.textContent = ok ? "connecté" : "hors ligne";
}