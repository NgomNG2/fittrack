import { state } from "./core.js";

export function populateMuscleFilter() {
  const select = document.getElementById("muscleFilter");
  const groups = [...new Set(state.exercises.map((e) => e.muscleGroup))].sort();
  groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
  select.addEventListener("change", renderExercises);
  document.getElementById("exerciseSearch").addEventListener("input", renderExercises);
}

export function renderExercises() {
  const search = document.getElementById("exerciseSearch").value.trim().toLowerCase();
  const muscle = document.getElementById("muscleFilter").value;
  const list = state.exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search);
    const matchMuscle = muscle === "all" || ex.muscleGroup === muscle;
    return matchSearch && matchMuscle;
  });

  const container = document.getElementById("exerciseList");
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucun exercice ne correspond à ta recherche.</div>`;
    return;
  }
  container.innerHTML = list
    .map(
      (ex) => `
    <div class="exercise-card">
      <span class="tag">${ex.muscleGroup}</span>
      <h3>${ex.name}</h3>
      <p>${ex.description || ""}</p>
    </div>`
    )
    .join("");
}