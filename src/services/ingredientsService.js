import Papa from "papaparse";

const INGREDIENTS_CSV_URL =
  import.meta.env.VITE_INGREDIENTS_CSV_URL;

const INGREDIENTS_STORAGE_KEY = "cuaderno.ingredients";

const NUMERIC_FIELDS = [
  "portionGrams",
  "referenceAmount",
  "calories",
  "protein",
  "carbs",
  "fat",
];

function normalizeIngredient(row) {
  const ingredient = {};

  Object.entries(row).forEach(([key, value]) => {
    const cleanKey = String(key).trim();

    if (!cleanKey) {
      return;
    }

    if (NUMERIC_FIELDS.includes(cleanKey)) {
      const normalizedValue = String(value ?? "")
        .trim()
        .replace(",", ".");

      const numericValue = Number(normalizedValue);

      ingredient[cleanKey] = Number.isFinite(numericValue)
        ? numericValue
        : 0;

      return;
    }

    ingredient[cleanKey] = String(value ?? "").trim();
  });

  return ingredient;
}

export async function fetchIngredients() {
  if (!INGREDIENTS_CSV_URL) {
    throw new Error(
      "Falta configurar VITE_INGREDIENTS_CSV_URL en el archivo .env.",
    );
  }

  const response = await fetch(INGREDIENTS_CSV_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo descargar la planilla: ${response.status}`,
    );
  }

  const csvText = await response.text();

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    console.warn(
      "Se encontraron errores al leer el CSV:",
      result.errors,
    );
  }

  const ingredients = result.data
    .map(normalizeIngredient)
    .filter(
      (ingredient) => ingredient.id && ingredient.name,
    );

  localStorage.setItem(
    INGREDIENTS_STORAGE_KEY,
    JSON.stringify(ingredients),
  );

  return ingredients;
}

export function getCachedIngredients() {
  try {
    const storedIngredients = localStorage.getItem(
      INGREDIENTS_STORAGE_KEY,
    );

    if (!storedIngredients) {
      return [];
    }

    const parsedIngredients = JSON.parse(storedIngredients);

    return Array.isArray(parsedIngredients)
      ? parsedIngredients
      : [];
  } catch {
    return [];
  }
}