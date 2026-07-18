import { useState } from "react";
import RecipeForm from "../components/RecipeForm";
import useRecipes from "../hooks/useRecipes";

function Recipes() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { recipes, addRecipe, deleteRecipe } = useRecipes();

  function handleAddRecipe(recipeData) {
    addRecipe(recipeData);
    setIsFormOpen(false);
  }

  return (
    <main className="page-content">
      <div className="recipes-heading">
        <div className="page-introduction">
          <p className="section-label">Base de datos</p>
          <h2>Preparaciones</h2>
          <p>
            Guarda los platos que después podrás incorporar al menú semanal.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <span aria-hidden="true">＋</span>
          Nueva preparación
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-recipes">
          <h3>Aún no hay preparaciones</h3>
          <p>Crea tu primer plato para comenzar el recetario.</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe, index) => (
            <article className="recipe-card" key={recipe.id}>
              <div className="recipe-card-top">
                <span className="recipe-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="recipe-calories">
                  {recipe.calories} kcal
                </span>
              </div>

              <h3>{recipe.name}</h3>

              <p>
                {recipe.description || "Preparación sin descripción."}
              </p>

              <div className="recipe-card-footer">
                <span>{recipe.portion}</span>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteRecipe(recipe.id)}
                  aria-label={`Eliminar ${recipe.name}`}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <RecipeForm
          onSubmit={handleAddRecipe}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </main>
  );
}

export default Recipes;
