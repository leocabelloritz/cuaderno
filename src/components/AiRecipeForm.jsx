import { useState } from "react";
import {
  estimateDishNutrition,
  getNutritionAiEndpoint,
  saveNutritionAiEndpoint,
} from "../services/nutritionAiService";

const INITIAL_FORM = {
  name: "",
  description: "",
  portionSize: "normal",
};

function AiRecipeForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [endpointDraft, setEndpointDraft] = useState(
    getNutritionAiEndpoint(),
  );
  const [showConnection, setShowConnection] = useState(
    !getNutritionAiEndpoint(),
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    const cleanName = formData.name.trim();

    if (!cleanName) {
      setError("Escribe el nombre del plato antes de analizarlo.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const analysis = await estimateDishNutrition({
        name: cleanName,
        description: formData.description.trim(),
        portionSize: formData.portionSize,
      });

      setResult(analysis);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible analizar el plato.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleSaveEndpoint() {
    const saved = saveNutritionAiEndpoint(endpointDraft);
    setEndpointDraft(saved);
    setShowConnection(!saved);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!result) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      portion: result.portionLabel || `${result.portionGrams} g aprox.`,
      servings: 1,
      description:
        formData.description.trim() || result.description || "",
      ingredients: result.ingredients || [],
      totalNutrition: {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      },
      nutritionPerServing: {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      },
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      estimated: true,
      source: "workers-ai",
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section
        className="recipe-modal ai-recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-recipe-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="section-label">Estimación inteligente</p>
            <h2 id="ai-recipe-form-title">Nueva preparación con IA</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onCancel}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="recipe-form ai-recipe-form" onSubmit={handleSubmit}>
          <div className="ai-intro-card">
            <span className="ai-status-dot" aria-hidden="true" />
            <p>
              Describe el plato de forma normal. Cuaderno estimará una porción
              razonable y sus macros para usarla en el menú.
            </p>
          </div>

          <label>
            Plato
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ejemplo: pasta con boloñesa de soya"
              autoFocus
              required
            />
          </label>

          <label>
            Detalles opcionales
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Ejemplo: con salsa de tomate casera, queso y ensalada"
            />
          </label>

          <label>
            Tamaño de porción
            <select
              name="portionSize"
              value={formData.portionSize}
              onChange={handleChange}
            >
              <option value="small">Pequeña</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
          </label>

          <button
            type="button"
            className="primary-button ai-analyze-button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !formData.name.trim()}
          >
            {isAnalyzing ? "Analizando plato /" : "Analizar con IA"}
          </button>

          {error && <p className="ai-error-message">{error}</p>}

          {result && (
            <section className="ai-result-card" aria-live="polite">
              <div className="ai-result-heading">
                <div>
                  <p className="section-label">Resultado estimado</p>
                  <h3>{result.portionLabel || `${result.portionGrams} g`}</h3>
                </div>

                <strong>{result.calories} kcal</strong>
              </div>

              <div className="macro-grid ai-macro-grid">
                <div>
                  <span>Proteínas</span>
                  <strong>{result.protein} g</strong>
                </div>
                <div>
                  <span>Carbohidratos</span>
                  <strong>{result.carbs} g</strong>
                </div>
                <div>
                  <span>Grasas</span>
                  <strong>{result.fat} g</strong>
                </div>
              </div>

              {Array.isArray(result.ingredients) &&
                result.ingredients.length > 0 && (
                  <div className="ai-ingredients-preview">
                    <span>Estimación usada</span>
                    <ul>
                      {result.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient.name}-${index}`}>
                          <span>{ingredient.name}</span>
                          <strong>{ingredient.grams} g</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <p className="ai-disclaimer">
                Valores aproximados. La receta real, marcas y método de cocción
                pueden cambiar el resultado.
              </p>
            </section>
          )}

          <div className="ai-connection-panel">
            <button
              type="button"
              className="ai-connection-toggle"
              onClick={() => setShowConnection((current) => !current)}
            >
              {getNutritionAiEndpoint()
                ? "Conexión IA configurada"
                : "Conectar analizador IA"}
              <span>{showConnection ? "−" : "+"}</span>
            </button>

            {showConnection && (
              <div className="ai-connection-body">
                <p>
                  Pega una vez la URL del Worker de Cuaderno. Se guarda solo en
                  este dispositivo.
                </p>
                <input
                  type="url"
                  value={endpointDraft}
                  onChange={(event) => setEndpointDraft(event.target.value)}
                  placeholder="https://cuaderno-nutrition-ai....workers.dev"
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleSaveEndpoint}
                >
                  Guardar conexión
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={!result}
            >
              Guardar preparación
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AiRecipeForm;
