import { useMemo, useState } from "react";
import { useIngredients } from "../hooks/useIngredients";
import {
  calculateRecipeNutrition,
  divideNutritionByServings,
  roundNutrition,
} from "../utils/nutrition";

const INITIAL_FORM = {
  name: "",
  portion: "",
  servings: 1,
  description: "",
};

function RecipeForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState([]);

  const {
    ingredients,
    isLoading: ingredientsLoading,
    error: ingredientsError,
    refreshIngredients,
  } = useIngredients();

  const filteredIngredients = useMemo(() => {
    const cleanSearch = ingredientSearch.trim().toLowerCase();

    if (!cleanSearch) {
      return ingredients.slice(0, 12);
    }

    return ingredients
      .filter((ingredient) =>
        ingredient.name
          ?.toLowerCase()
          .includes(cleanSearch),
      )
      .slice(0, 12);
  }, [ingredientSearch, ingredients]);

  const selectedIngredient = useMemo(() => {
    return ingredients.find(
      (ingredient) =>
        ingredient.id === selectedIngredientId,
    );
  }, [ingredients, selectedIngredientId]);

  const totalNutrition = useMemo(() => {
    const ingredientsForCalculation = recipeIngredients
      .map((recipeIngredient) => {
        const ingredient = ingredients.find(
          (item) =>
            item.id === recipeIngredient.ingredientId,
        );

        if (!ingredient) {
          return null;
        }

        return {
          ingredient,
          amount: recipeIngredient.amount,
        };
      })
      .filter(Boolean);

    return roundNutrition(
      calculateRecipeNutrition(ingredientsForCalculation),
    );
  }, [recipeIngredients, ingredients]);

  const nutritionPerServing = useMemo(() => {
    return roundNutrition(
      divideNutritionByServings(
        totalNutrition,
        Number(formData.servings),
      ),
    );
  }, [totalNutrition, formData.servings]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSearchChange(event) {
    setIngredientSearch(event.target.value);
    setSelectedIngredientId("");
  }

  function handleSelectIngredient(ingredient) {
    setSelectedIngredientId(ingredient.id);
    setIngredientSearch(ingredient.name);
  }

  function handleAddIngredient() {
    const amount = Number(ingredientAmount);

    if (!selectedIngredientId || amount <= 0) {
      return;
    }

    if (!selectedIngredient) {
      return;
    }

    setRecipeIngredients((currentIngredients) => [
      ...currentIngredients,
      {
        entryId: crypto.randomUUID(),
        ingredientId: selectedIngredient.id,
        amount,
      },
    ]);

    setIngredientSearch("");
    setSelectedIngredientId("");
    setIngredientAmount("");
  }

  function handleRemoveIngredient(entryId) {
    setRecipeIngredients((currentIngredients) =>
      currentIngredients.filter(
        (ingredient) => ingredient.entryId !== entryId,
      ),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanName = formData.name.trim();
    const cleanPortion = formData.portion.trim();
    const servings = Number(formData.servings);

    if (
      !cleanName ||
      !cleanPortion ||
      servings <= 0 ||
      recipeIngredients.length === 0
    ) {
      return;
    }

    onSubmit({
      name: cleanName,
      portion: cleanPortion,
      servings,
      description: formData.description.trim(),

      ingredients: recipeIngredients.map(
        ({ ingredientId, amount }) => ({
          ingredientId,
          amount,
        }),
      ),

      totalNutrition,
      nutritionPerServing,

      calories: nutritionPerServing.calories,
      protein: nutritionPerServing.protein,
      carbs: nutritionPerServing.carbs,
      fat: nutritionPerServing.fat,
    });

    setFormData(INITIAL_FORM);
    setIngredientSearch("");
    setSelectedIngredientId("");
    setIngredientAmount("");
    setRecipeIngredients([]);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section
        className="recipe-modal recipe-modal-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="section-label">Base de datos</p>
            <h2 id="recipe-form-title">
              Nueva preparación
            </h2>
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

        <form
          className="recipe-form"
          onSubmit={handleSubmit}
        >
          <label>
            Nombre
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ejemplo: Lasaña vegetariana"
              autoFocus
              required
            />
          </label>

          <div className="form-row">
            <label>
              Porción base
              <input
                type="text"
                name="portion"
                value={formData.portion}
                onChange={handleChange}
                placeholder="Ejemplo: 1 plato"
                required
              />
            </label>

            <label>
              Porciones que rinde
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
            </label>
          </div>

          <section className="ingredient-builder">
            <div className="ingredient-builder-header">
              <div>
                <p className="section-label">
                  Ingredientes
                </p>
                <h3>Armar preparación</h3>
              </div>

              <span>
                {recipeIngredients.length} añadidos
              </span>
            </div>

            {ingredientsLoading && (
              <p className="ingredient-empty-message">
                Cargando ingredientes...
              </p>
            )}

            {ingredientsError && (
              <div className="ingredients-error">
                <p>{ingredientsError}</p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={refreshIngredients}
                >
                  Reintentar
                </button>
              </div>
            )}

            <div className="ingredient-search-wrapper">
              <label>
                Buscar ingrediente
                <input
                  type="search"
                  value={ingredientSearch}
                  onChange={handleSearchChange}
                  placeholder="Ejemplo: avena, arroz, tofu..."
                  autoComplete="off"
                  disabled={ingredientsLoading}
                />
              </label>

              {ingredientSearch &&
                !selectedIngredientId &&
                !ingredientsLoading && (
                  <div className="ingredient-search-results">
                    {filteredIngredients.length > 0 ? (
                      filteredIngredients.map(
                        (ingredient) => (
                          <button
                            key={ingredient.id}
                            type="button"
                            className="ingredient-search-option"
                            onClick={() =>
                              handleSelectIngredient(
                                ingredient,
                              )
                            }
                          >
                            <span>{ingredient.name}</span>

                            <small>
                              {ingredient.householdPortion ||
                                `${ingredient.referenceAmount} ${ingredient.unit}`}
                            </small>
                          </button>
                        ),
                      )
                    ) : (
                      <p className="ingredient-empty-message">
                        No encontramos ingredientes.
                      </p>
                    )}
                  </div>
                )}
            </div>

            <div className="ingredient-amount-row">
              <label>
                Cantidad
                <input
                  type="number"
                  value={ingredientAmount}
                  onChange={(event) =>
                    setIngredientAmount(event.target.value)
                  }
                  min="0.1"
                  step="0.1"
                  placeholder="100"
                  disabled={!selectedIngredientId}
                />
              </label>

              <div className="ingredient-unit-display">
                <span>Unidad</span>
                <strong>
                  {selectedIngredient?.unit || "—"}
                </strong>
              </div>

              <button
                type="button"
                className="primary-button ingredient-add-button"
                onClick={handleAddIngredient}
                disabled={
                  !selectedIngredientId ||
                  Number(ingredientAmount) <= 0
                }
              >
                Agregar
              </button>
            </div>

            <div className="selected-ingredients-list">
              {recipeIngredients.length === 0 ? (
                <p className="ingredient-empty-message">
                  Todavía no agregas ingredientes.
                </p>
              ) : (
                recipeIngredients.map(
                  (recipeIngredient) => {
                    const ingredient = ingredients.find(
                      (item) =>
                        item.id ===
                        recipeIngredient.ingredientId,
                    );

                    if (!ingredient) {
                      return null;
                    }

                    return (
                      <article
                        key={recipeIngredient.entryId}
                        className="selected-ingredient-card"
                      >
                        <div>
                          <strong>
                            {ingredient.name}
                          </strong>

                          <span>
                            {recipeIngredient.amount}{" "}
                            {ingredient.unit}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="remove-ingredient-button"
                          onClick={() =>
                            handleRemoveIngredient(
                              recipeIngredient.entryId,
                            )
                          }
                          aria-label={`Eliminar ${ingredient.name}`}
                        >
                          ×
                        </button>
                      </article>
                    );
                  },
                )
              )}
            </div>
          </section>

          <section className="nutrition-summary">
            <div className="nutrition-summary-header">
              <div>
                <p className="section-label">
                  Información nutricional
                </p>
                <h3>Por porción</h3>
              </div>

              <strong>
                {nutritionPerServing.calories} kcal
              </strong>
            </div>

            <div className="macro-grid">
              <div>
                <span>Proteínas</span>
                <strong>
                  {nutritionPerServing.protein} g
                </strong>
              </div>

              <div>
                <span>Carbohidratos</span>
                <strong>
                  {nutritionPerServing.carbs} g
                </strong>
              </div>

              <div>
                <span>Grasas</span>
                <strong>
                  {nutritionPerServing.fat} g
                </strong>
              </div>
            </div>

            <p className="nutrition-total-note">
              Preparación completa:{" "}
              {totalNutrition.calories} kcal · P{" "}
              {totalNutrition.protein} g · C{" "}
              {totalNutrition.carbs} g · G{" "}
              {totalNutrition.fat} g
            </p>
          </section>

          <label>
            Descripción
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Breve descripción de la preparación"
            />
          </label>

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
              disabled={recipeIngredients.length === 0}
            >
              Guardar preparación
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RecipeForm;