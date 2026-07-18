import { useMemo, useState } from "react";

function RecipeSelectorModal({
  recipes,
  mealName,
  dayName,
  person,
  onSelect,
  onClose,
}) {
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return recipes;
    }

    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(normalizedSearch),
    );
  }, [recipes, search]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="recipe-modal selector-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selector-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="section-label">
              {person} · {dayName} · {mealName}
            </p>

            <h2 id="selector-title">Elegir preparación</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Cerrar selector"
          >
            ×
          </button>
        </div>

        <label className="recipe-search">
          <span>Buscar preparación</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ejemplo: avena, arroz, ensalada..."
            autoFocus
          />
        </label>

        {recipes.length === 0 ? (
          <div className="selector-empty-state">
            <h3>No hay preparaciones disponibles</h3>
            <p>Primero crea una preparación en la pestaña Preparaciones.</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="selector-empty-state">
            <h3>No encontramos coincidencias</h3>
            <p>Prueba con otro nombre.</p>
          </div>
        ) : (
          <div className="recipe-selector-list">
            {filteredRecipes.map((recipe) => (
              <button
                type="button"
                className="recipe-selector-option"
                key={recipe.id}
                onClick={() => onSelect(recipe)}
              >
                <div>
                  <strong>{recipe.name}</strong>

                  <span>
                    {recipe.portion}
                    {recipe.description
                      ? ` · ${recipe.description}`
                      : ""}
                  </span>
                </div>

                <span className="recipe-calories">
                  {recipe.calories} kcal
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default RecipeSelectorModal;
