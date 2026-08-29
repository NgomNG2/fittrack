import { state, goalProgress, formatDate } from "./core.js";
import { apiPost } from "./api.js";
import { toast } from "./toast.js";
import { openModal, closeModal } from "./modals.js";
import { renderDashboard } from "./dashboard.js";

export function setupGoalFormEvents() {
  document.getElementById("newGoalBtn").addEventListener("click", () => openModal("goalModal"));
  document.getElementById("goalForm").addEventListener("submit", submitGoalForm);
}

async function submitGoalForm(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("goalName").value.trim(),
    currentValue: Number(document.getElementById("goalCurrent").value),
    targetValue: Number(document.getElementById("goalTarget").value),
    unit: document.getElementById("goalUnit").value.trim(),
    deadline: document.getElementById("goalDeadline").value,
    status: "en cours",
  };
  try {
    const created = await apiPost("/goals", payload);
    state.goals.push(created);
    e.target.reset();
    closeModal("goalModal");
    renderGoals();
    renderDashboard();
    toast("Objectif créé");
  } catch (err) {
    console.error(err);
    toast("Erreur lors de la création de l'objectif", true);
  }
}

export function renderGoals() {
  const container = document.getElementById("goalList");
  if (state.goals.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucun objectif défini pour le moment.</div>`;
    return;
  }
  container.innerHTML = state.goals
    .map((g) => {
      const pct = goalProgress(g);
      return `
      <div class="goal-card">
        <h3>${g.name}</h3>
        <div class="goal-values"><strong>${g.currentValue}</strong> ${g.unit} → cible ${g.targetValue} ${g.unit}</div>
        <div class="barbell"><div class="barbell-fill" style="width:${pct}%"></div></div>
        <div class="goal-foot">
          <span class="goal-deadline">${g.deadline ? "Échéance : " + formatDate(g.deadline) : "Sans échéance"}</span>
          <span class="goal-pct">${pct}%</span>
        </div>
      </div>`;
    })
    .join("");
}