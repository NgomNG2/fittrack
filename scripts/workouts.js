import { state, formatDate, exerciseName, workoutVolume } from "./core.js";
import { apiPost, apiPut, apiDelete } from "./api.js";
import { toast } from "./toast.js";
import { openModal, closeModal } from "./modals.js";
import { renderDashboard } from "./dashboard.js";

/* ============================================================
   SÉANCES — liste
   ============================================================ */

export function renderWorkouts() {
  const container = document.getElementById("workoutList");
  if (state.workouts.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucune séance enregistrée. Ajoute ta première séance !</div>`;
    return;
  }
  container.innerHTML = state.workouts
    .map((w) => {
      const nbExercises = (w.exercises || []).length;
      const volume = workoutVolume(w);
      return `
      <div class="workout-row" data-id="${w.id}">
        <span class="workout-date">${formatDate(w.date)}</span>
        <span class="workout-name">${w.name}</span>
        <span class="workout-meta">
          <span>${nbExercises} exercice${nbExercises > 1 ? "s" : ""}</span>
          <span>${volume.toLocaleString("fr-FR")} kg volume</span>
          ${w.duration ? `<span>${w.duration} min</span>` : ""}
        </span>
        <span class="workout-actions">
          <button class="icon-btn" data-edit="${w.id}" title="Modifier">✎</button>
          <button class="icon-btn" data-delete="${w.id}" title="Supprimer">🗑</button>
        </span>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".workout-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("[data-edit], [data-delete]")) return;
      openWorkoutDetail(Number(row.dataset.id));
    });
  });
  container.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openWorkoutForm(Number(btn.dataset.edit));
    })
  );
  container.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Supprimer cette séance ?")) return;
      await apiDelete("/workouts/" + btn.dataset.delete);
      state.workouts = state.workouts.filter((w) => w.id !== Number(btn.dataset.delete));
      renderWorkouts();
      renderDashboard();
      toast("Séance supprimée");
    })
  );
}

/* ============================================================
   SÉANCES — détail
   ============================================================ */

function openWorkoutDetail(id) {
  const w = state.workouts.find((x) => x.id === id);
  if (!w) return;
  document.getElementById("detailWorkoutTitle").textContent = `${w.name} — ${formatDate(w.date)}`;
  const body = document.getElementById("workoutDetailBody");
  const blocks = (w.exercises || [])
    .map((ex) => {
      const rows = (ex.sets || [])
        .map((s) => `<tr><td>#${s.setNumber}</td><td>${s.repetitions} reps</td><td>${s.weight} kg</td></tr>`)
        .join("");
      return `
      <div class="detail-block">
        <h4>${exerciseName(ex.exerciseId)}</h4>
        <table class="set-table">
          <thead><tr><th>Série</th><th>Répétitions</th><th>Charge</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("");
  body.innerHTML = `
    ${blocks || '<p class="empty-state">Aucun exercice enregistré pour cette séance.</p>'}
    ${w.notes ? `<div class="detail-block"><h4>Notes</h4><p class="detail-notes">${w.notes}</p></div>` : ""}
  `;
  openModal("workoutDetailModal");
}

/* ============================================================
   SÉANCES — création / édition (formulaire dynamique)
   ============================================================ */

export function setupWorkoutFormEvents() {
  document.getElementById("newWorkoutBtn").addEventListener("click", () => openWorkoutForm());
  document.getElementById("addExerciseRow").addEventListener("click", () => addExerciseRow());
  document.getElementById("workoutForm").addEventListener("submit", submitWorkoutForm);
  document.getElementById("templateSelect").addEventListener("change", applyTemplate);
}

export function populateTemplateSelect() {
  const select = document.getElementById("templateSelect");
  select.innerHTML = '<option value="">— Partir d\'une séance vide —</option>';
  state.templates.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.name} (${t.description})`;
    select.appendChild(opt);
  });
}

function applyTemplate(e) {
  const templateId = Number(e.target.value);
  if (!templateId) return;
  const template = state.templates.find((t) => t.id === templateId);
  if (!template) return;

  document.getElementById("exerciseRows").innerHTML = "";
  document.querySelectorAll(".add-set-btn").forEach((btn) => btn.remove());
  template.exerciseIds.forEach((exId) =>
    addExerciseRow({ exerciseId: exId, sets: [{ setNumber: 1, repetitions: "", weight: "" }] })
  );

  if (!document.getElementById("workoutName").value) {
    document.getElementById("workoutName").value = template.name;
  }
}

function openWorkoutForm(id = null) {
  const form = document.getElementById("workoutForm");
  form.reset();
  document.getElementById("exerciseRows").innerHTML = "";
  document.querySelectorAll(".add-set-btn").forEach((btn) => btn.remove());
  document.getElementById("workoutId").value = "";
  document.getElementById("templateSelect").value = "";

  if (id) {
    const w = state.workouts.find((x) => x.id === id);
    document.getElementById("workoutModalTitle").textContent = "Modifier la séance";
    document.getElementById("workoutId").value = w.id;
    document.getElementById("workoutName").value = w.name;
    document.getElementById("workoutDate").value = w.date;
    document.getElementById("workoutDuration").value = w.duration || "";
    document.getElementById("workoutNotes").value = w.notes || "";
    (w.exercises || []).forEach((ex) => addExerciseRow(ex));
  } else {
    document.getElementById("workoutModalTitle").textContent = "Nouvelle séance";
    document.getElementById("workoutDate").valueAsDate = new Date();
    addExerciseRow();
  }
  openModal("workoutModal");
}

function addExerciseRow(existing = null) {
  const container = document.getElementById("exerciseRows");
  const rowId = "row-" + Math.random().toString(36).slice(2, 9);

  const options = state.exercises
    .map((ex) => `<option value="${ex.id}" ${existing && existing.exerciseId === ex.id ? "selected" : ""}>${ex.name}</option>`)
    .join("");

  const row = document.createElement("div");
  row.className = "exercise-row-builder";
  row.dataset.rowId = rowId;
  row.innerHTML = `
    <select class="input ex-select">${options}</select>
    <div class="sets-mini" data-sets></div>
    <button type="button" class="mini-remove" data-remove-row title="Retirer cet exercice">&times;</button>
  `;
  container.appendChild(row);

  const setsContainer = row.querySelector("[data-sets]");
  const initialSets = existing && existing.sets && existing.sets.length ? existing.sets : [{ setNumber: 1, repetitions: "", weight: "" }];
  initialSets.forEach((s) => addSetRow(setsContainer, s));

  const addSetBtn = document.createElement("button");
  addSetBtn.type = "button";
  addSetBtn.className = "add-set-btn";
  addSetBtn.textContent = "+ Ajouter une série";
  addSetBtn.addEventListener("click", () => addSetRow(setsContainer));
  setsContainer.after(addSetBtn);

  row.querySelector("[data-remove-row]").addEventListener("click", () => {
    row.remove();
    addSetBtn.remove();
  });
}

function addSetRow(setsContainer, existing = null) {
  const n = setsContainer.children.length + 1;
  const line = document.createElement("div");
  line.className = "set-mini-row";
  line.innerHTML = `
    <span>#${n}</span>
    <input type="number" min="1" placeholder="Reps" class="set-reps" value="${existing ? existing.repetitions : ""}" required />
    <input type="number" min="0" step="0.5" placeholder="Charge (kg)" class="set-weight" value="${existing ? existing.weight : ""}" required />
    <button type="button" class="mini-remove" title="Retirer">&times;</button>
  `;
  line.querySelector(".mini-remove").addEventListener("click", () => {
    line.remove();
    renumberSets(setsContainer);
  });
  setsContainer.appendChild(line);
}

function renumberSets(setsContainer) {
  [...setsContainer.children].forEach((line, i) => {
    line.querySelector("span").textContent = "#" + (i + 1);
  });
}

async function submitWorkoutForm(e) {
  e.preventDefault();
  const id = document.getElementById("workoutId").value;

  const exercisesPayload = [...document.querySelectorAll(".exercise-row-builder")].map((row) => {
    const exerciseId = Number(row.querySelector(".ex-select").value);
    const sets = [...row.querySelectorAll(".set-mini-row")].map((line, i) => ({
      setNumber: i + 1,
      repetitions: Number(line.querySelector(".set-reps").value),
      weight: Number(line.querySelector(".set-weight").value),
    }));
    return { exerciseId, sets };
  });

  const payload = {
    name: document.getElementById("workoutName").value.trim(),
    date: document.getElementById("workoutDate").value,
    duration: Number(document.getElementById("workoutDuration").value) || 0,
    notes: document.getElementById("workoutNotes").value.trim(),
    exercises: exercisesPayload,
  };

  try {
    if (id) {
      const updated = await apiPut("/workouts/" + id, { id: Number(id), ...payload });
      state.workouts = state.workouts.map((w) => (w.id === Number(id) ? updated : w));
      toast("Séance mise à jour");
    } else {
      const created = await apiPost("/workouts", payload);
      state.workouts.unshift(created);
      toast("Séance créée");
    }
    state.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    closeModal("workoutModal");
    renderWorkouts();
    renderDashboard();
  } catch (err) {
    console.error(err);
    toast("Erreur : impossible d'enregistrer la séance", true);
  }
}

/* ============================================================
   EXPORT (CSV + PDF via impression)
   ============================================================ */

export function setupExportButtons() {
  document.getElementById("exportCsvBtn").addEventListener("click", exportWorkoutsCsv);
  document.getElementById("exportPdfBtn").addEventListener("click", exportWorkoutsPdf);
}

function exportWorkoutsCsv() {
  if (state.workouts.length === 0) {
    toast("Aucune séance à exporter", true);
    return;
  }
  const rows = [["Séance", "Date", "Durée (min)", "Exercice", "Série", "Répétitions", "Charge (kg)"]];
  state.workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        rows.push([w.name, w.date, w.duration || "", exerciseName(ex.exerciseId), s.setNumber, s.repetitions, s.weight]);
      });
    });
  });

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fittrack_seances.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast("Export CSV téléchargé");
}

function exportWorkoutsPdf() {
  if (state.workouts.length === 0) {
    toast("Aucune séance à exporter", true);
    return;
  }
  const totalVolume = state.workouts.reduce((sum, w) => sum + workoutVolume(w), 0);
  const lastWeight = state.weightHistory[state.weightHistory.length - 1];

  const rows = state.workouts
    .map((w) => {
      const exList = (w.exercises || []).map((ex) => exerciseName(ex.exerciseId)).join(", ") || "—";
      return `<tr>
        <td>${formatDate(w.date)}</td>
        <td>${w.name}</td>
        <td>${w.duration || "–"} min</td>
        <td>${exList}</td>
        <td>${workoutVolume(w).toLocaleString("fr-FR")} kg</td>
      </tr>`;
    })
    .join("");

  document.getElementById("printReport").innerHTML = `
    <h1>FITTRACK Lite — Bilan d'entraînement</h1>
    <p class="print-meta">
      Généré le ${new Date().toLocaleDateString("fr-FR")} ·
      ${state.workouts.length} séance(s) · Volume total : ${totalVolume.toLocaleString("fr-FR")} kg
      ${lastWeight ? " · Poids actuel : " + lastWeight.weight + " kg" : ""}
    </p>
    <table>
      <thead><tr><th>Date</th><th>Séance</th><th>Durée</th><th>Exercices</th><th>Volume</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  window.print();
}