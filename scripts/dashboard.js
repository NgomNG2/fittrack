import { state, formatDate, exerciseName, workoutVolume, goalProgress, chartBaseOptions } from "./core.js";

export function renderDashboard() {
  document.getElementById("statSessions").textContent = state.workouts.length;

  const last = state.workouts[0];
  document.getElementById("statLastSession").textContent = last ? `${last.name} — ${formatDate(last.date)}` : "Aucune";

  const lastWeight = state.weightHistory[state.weightHistory.length - 1];
  document.getElementById("statWeight").textContent = lastWeight ? `${lastWeight.weight} kg` : "–";

  const totalVolume = state.workouts.reduce((sum, w) => sum + workoutVolume(w), 0);
  document.getElementById("statVolume").textContent = totalVolume.toLocaleString("fr-FR") + " kg";

  renderDashWeightChart();
  renderDashGoals();
  renderBestLifts();
}

function renderDashWeightChart() {
  const ctx = document.getElementById("dashWeightChart");
  if (!ctx) return;
  const labels = state.weightHistory.map((w) => formatDate(w.date));
  const data = state.weightHistory.map((w) => w.weight);

  if (state.dashChart) state.dashChart.destroy();
  state.dashChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: "#2BD9A8",
          backgroundColor: "rgba(43,217,168,0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: "#2BD9A8",
        },
      ],
    },
    options: chartBaseOptions(),
  });
}

function renderDashGoals() {
  const container = document.getElementById("dashGoals");
  if (state.goals.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucun objectif.</div>`;
    return;
  }
  container.innerHTML = state.goals
    .slice(0, 4)
    .map((g) => {
      const pct = goalProgress(g);
      return `
      <div class="goal-mini">
        <div class="goal-mini-head"><span>${g.name}</span><span>${g.currentValue}/${g.targetValue} ${g.unit}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");
}

function renderBestLifts() {
  const best = {};
  state.workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      const maxWeight = Math.max(0, ...(ex.sets || []).map((s) => s.weight));
      if (!best[ex.exerciseId] || maxWeight > best[ex.exerciseId]) {
        best[ex.exerciseId] = maxWeight;
      }
    });
  });

  const container = document.getElementById("dashBestLifts");
  const entries = Object.entries(best).filter(([, w]) => w > 0);
  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state">Pas encore de données de performance.</div>`;
    return;
  }
  container.innerHTML = entries
    .map(([exId, w]) => `<div class="best-lift-item"><div class="name">${exerciseName(exId)}</div><div class="value">${w} kg</div></div>`)
    .join("");
}