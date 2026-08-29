// État partagé par toute l'application. Un seul objet, importé partout où
// il faut lire ou modifier les données chargées depuis json-server.
export const state = {
  exercises: [],
  workouts: [],
  goals: [],
  weightHistory: [],
  templates: [],
  currentView: "dashboard",
  dashChart: null,
  progressChart: null,
  compareChart: null,
  weightPeriod: 7,
};

export function formatDate(dateStr) {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function exerciseName(id) {
  const ex = state.exercises.find((e) => e.id === Number(id));
  return ex ? ex.name : "Exercice inconnu";
}

export function workoutVolume(w) {
  return (w.exercises || []).reduce((total, ex) => {
    return total + (ex.sets || []).reduce((s, set) => s + set.repetitions * set.weight, 0);
  }, 0);
}

export function goalProgress(g) {
  const pct = g.targetValue === 0 ? 0 : Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
  return isNaN(pct) ? 0 : pct;
}

export function filterByPeriod(history, period) {
  if (period === "all") return history;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  return history.filter((w) => new Date(w.date) >= cutoff);
}

export function chartBaseOptions() {
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#2B3336" }, ticks: { color: "#91999C", font: { size: 11 } } },
      y: { grid: { color: "#2B3336" }, ticks: { color: "#91999C", font: { size: 11 } } },
    },
  };
}