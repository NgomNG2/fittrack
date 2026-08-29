export const API_URL = "http://localhost:3000";

export async function apiGet(path) {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error("GET " + path + " a échoué");
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("POST " + path + " a échoué");
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(API_URL + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("PUT " + path + " a échoué");
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(API_URL + path, { method: "DELETE" });
  if (!res.ok) throw new Error("DELETE " + path + " a échoué");
}