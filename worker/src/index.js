const ALLOWED_ORIGINS = new Set([
  "https://leocabelloritz.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://leocabelloritz.github.io";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request),
    },
  });
}

function normalizeResult(result) {
  const calories = Math.max(0, Math.round(Number(result.calories) || 0));
  const protein = Math.max(0, Math.round((Number(result.protein) || 0) * 10) / 10);
  const carbs = Math.max(0, Math.round((Number(result.carbs) || 0) * 10) / 10);
  const fat = Math.max(0, Math.round((Number(result.fat) || 0) * 10) / 10);
  const portionGrams = Math.max(1, Math.round(Number(result.portionGrams) || 0));

  const ingredients = Array.isArray(result.ingredients)
    ? result.ingredients
        .slice(0, 10)
        .map((ingredient) => ({
          name: String(ingredient?.name || "Ingrediente").slice(0, 80),
          grams: Math.max(0, Math.round(Number(ingredient?.grams) || 0)),
        }))
        .filter((ingredient) => ingredient.grams > 0)
    : [];

  if (!calories || !portionGrams) {
    throw new Error("La estimación recibida está incompleta.");
  }

  return {
    portionGrams,
    portionLabel:
      String(result.portionLabel || "").trim().slice(0, 80) ||
      `${portionGrams} g aprox.`,
    calories,
    protein,
    carbs,
    fat,
    description: String(result.description || "").trim().slice(0, 240),
    ingredients,
  };
}

const NUTRITION_SCHEMA = {
  type: "object",
  properties: {
    portionGrams: { type: "number" },
    portionLabel: { type: "string" },
    calories: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fat: { type: "number" },
    description: { type: "string" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          grams: { type: "number" },
        },
        required: ["name", "grams"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "portionGrams",
    "portionLabel",
    "calories",
    "protein",
    "carbs",
    "fat",
    "description",
    "ingredients",
  ],
  additionalProperties: false,
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(request, {
        ok: true,
        service: "cuaderno-nutrition-ai",
        model: "llama-3.1-8b-instruct-fast",
      });
    }

    if (request.method !== "POST" || url.pathname !== "/analyze") {
      return jsonResponse(request, { error: "Ruta no encontrada." }, 404);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(request, { error: "Solicitud inválida." }, 400);
    }

    const name = String(body?.name || "").trim().slice(0, 140);
    const description = String(body?.description || "").trim().slice(0, 500);
    const portionSize = ["small", "normal", "large"].includes(body?.portionSize)
      ? body.portionSize
      : "normal";

    if (!name) {
      return jsonResponse(request, { error: "Falta el nombre del plato." }, 400);
    }

    const sizeGuide = {
      small: "porción pequeña para un adulto",
      normal: "porción normal y realista para un adulto",
      large: "porción grande para un adulto",
    }[portionSize];

    const systemPrompt = `Eres el estimador nutricional de Cuaderno, una app doméstica para planificar comidas en Chile.\n\nEstima UNA porción servida y razonable a partir del nombre del plato y sus detalles. Usa valores centrales y plausibles; no inventes precisión clínica. Considera preparaciones y porciones habituales en Chile cuando corresponda.\n\nDescompón el plato en hasta 10 componentes principales con gramos estimados. Calcula calorías, proteínas, carbohidratos y grasas de la porción completa. Los macros deben ser coherentes con las calorías de forma aproximada.`;

    const userPrompt = `Plato: ${name}\nTamaño solicitado: ${sizeGuide}\nDetalles aportados: ${description || "sin detalles adicionales"}`;

    try {
      const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 700,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: NUTRITION_SCHEMA,
        },
      });

      const rawResult = aiResponse?.response ?? aiResponse;
      const parsed =
        typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
      const normalized = normalizeResult(parsed);

      return jsonResponse(request, normalized);
    } catch (error) {
      console.error("Nutrition AI error", error);

      return jsonResponse(
        request,
        {
          error:
            "No pudimos estimar este plato ahora. Intenta nuevamente en unos segundos.",
        },
        502,
      );
    }
  },
};
