import { state, formatDate, filterByPeriod, chartBaseOptions } from "./core.js";
import { apiPost } from "./api.js";
import { toast } from "./toast.js";
import { renderDashboard } from "./dashboard.js";

/* ============================================================
   POIDS
   ============================================================ */

export function setupWeightFormEvents() {
  document.getElementById("weightForm").addEventListener("submit", submitWeightForm);
  document.getElementById("weightDate").valueAsDate = new Date();
}

async function submitWeightForm(e) {
  e.preventDefault();
  const weight = Number(document.getElementById("weightInput").value);
  const date = document.getElementById("weightDate").value;
  try {
    const created = await apiPost("/weightHistory", { weight, date });
    state.weightHistory.push(created);
    state.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    e.target.reset();
    document.getElementById("weightDate").valueAsDate = new Date();
    renderWeightHistory();
    renderProgressChart();
    renderDashboard();
    toast("Pesée enregistrée");
  } catch (err) {
    console.error(err);
    toast("Erreur lors de l'enregistrement du poids", true);
  }
}

export function renderWeightHistory() {
  const container = document.getElementById("weightHistoryList");
  if (state.weightHistory.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucune pesée enregistrée.</div>`;
    return;
  }
  const rows = [...state.weightHistory].reverse();
  container.innerHTML = rows
    .map((w) => `<div class="weight-history-row"><span class="w">${w.weight} kg</span><span class="d">${formatDate(w.date)}</span></div>`)
    .join("");
}

/* ============================================================
   PÉRIODE + GRAPHIQUE DE POIDS
   ============================================================ */

export function setupPeriodToggle() {
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.weightPeriod = btn.dataset.period === "all" ? "all" : Number(btn.dataset.period);
      renderProgressChart();
    });
  });
}

export function renderProgressChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;
  const filtered = filterByPeriod(state.weightHistory, state.weightPeriod);
  const labels = filtered.map((w) => formatDate(w.date));
  const data = filtered.map((w) => w.weight);

  if (state.progressChart) state.progressChart.destroy();
  state.progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Poids (kg)",
          data,
          borderColor: "#FF5A1F",
          backgroundColor: "rgba(255,90,31,0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "#FF5A1F",
        },
      ],
    },
    options: chartBaseOptions(),
  });
}

/* ============================================================
   COMPARAISON PAR EXERCICE
   ============================================================ */

export function populateCompareSelect() {
  const select = document.getElementById("compareExerciseSelect");
  const usedIds = new Set();
  state.workouts.forEach((w) => (w.exercises || []).forEach((ex) => usedIds.add(ex.exerciseId)));

  select.innerHTML = '<option value="">Choisir un exercice…</option>';
  [...usedIds]
    .map((id) => state.exercises.find((e) => e.id === id))
    .filter(Boolean)
    .forEach((ex) => {
      const opt = document.createElement("option");
      opt.value = ex.id;
      opt.textContent = ex.name;
      select.appendChild(opt);
    });

  select.removeEventListener("change", renderCompareChart);
  select.addEventListener("change", renderCompareChart);
}

function renderCompareChart() {
  const exerciseId = Number(document.getElementById("compareExerciseSelect").value);
  const ctx = document.getElementById("compareChart");
  const emptyState = document.getElementById("compareEmptyState");

  if (!exerciseId) {
    if (state.compareChart) {
      state.compareChart.destroy();
      state.compareChart = null;
    }
    ctx.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  const points = state.workouts
    .filter((w) => (w.exercises || []).some((ex) => ex.exerciseId === exerciseId))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((w) => {
      const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
      const maxWeight = Math.max(0, ...(ex.sets || []).map((s) => s.weight));
      return { date: formatDate(w.date), weight: maxWeight };
    });

  ctx.style.display = "block";
  emptyState.style.display = "none";

  if (state.compareChart) state.compareChart.destroy();
  state.compareChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: points.map((p) => p.date),
      datasets: [
        {
          label: "Charge max (kg)",
          data: points.map((p) => p.weight),
          borderColor: "#2BD9A8",
          backgroundColor: "rgba(43,217,168,0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "#2BD9A8",
        },
      ],
    },
    options: chartBaseOptions(),
  });
}