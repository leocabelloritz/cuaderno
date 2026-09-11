const STORAGE_KEY = "cuaderno-ai-endpoint";

export function getNutritionAiEndpoint() {
  const savedEndpoint = localStorage.getItem(STORAGE_KEY)?.trim();
  const envEndpoint = import.meta.env.VITE_AI_ENDPOINT?.trim();

  return savedEndpoint || envEndpoint || "";
}

export function saveNutritionAiEndpoint(endpoint) {
  const cleanEndpoint = endpoint.trim().replace(/\/$/, "");

  if (!cleanEndpoint) {
    localStorage.removeItem(STORAGE_KEY);
    return "";
  }

  localStorage.setItem(STORAGE_KEY, cleanEndpoint);
  return cleanEndpoint;
}

export async function estimateDishNutrition({
  name,
  description,
  portionSize,
}) {
  const endpoint = getNutritionAiEndpoint();

  if (!endpoint) {
    throw new Error(
      "Falta conectar el analizador de IA. Agrega la URL del Worker de Cuaderno.",
    );
  }

  const response = await fetch(`${endpoint}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      portionSize,
    }),
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // Dejamos que el error genérico de abajo explique el problema.
  }

  if (!response.ok) {
    throw new Error(
      payload?.error || "No fue posible analizar el plato en este momento.",
    );
  }

  return payload;
}
