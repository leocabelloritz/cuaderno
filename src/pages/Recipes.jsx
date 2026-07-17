const SAMPLE_RECIPES = [
  {
    id: 1,
    name: "Avena con banana",
    portion: "1 bowl",
    calories: 320,
    description: "Avena cocida con leche y banana en rodajas.",
  },
  {
    id: 2,
    name: "Arroz integral",
    portion: "1 taza",
    calories: 216,
    description: "Arroz integral cocido y ligeramente sazonado.",
  },
  {
    id: 3,
    name: "Ensalada de vegetales",
    portion: "1 plato",
    calories: 90,
    description: "Lechuga, tomate, pepino y aliño de la casa.",
  },
];

function Recipes() {
  return (
    <main className="page-content">
      <div className="recipes-heading">
        <div className="page-introduction">
          <p className="section-label">Base de datos</p>
          <h2>Preparaciones</h2>
          <p>
            Aquí guardaremos los platos que después podrás incorporar al menú
            semanal.
          </p>
        </div>

        <button type="button" className="primary-button">
          <span aria-hidden="true">＋</span>
          Nueva preparación
        </button>
      </div>

      <div className="recipe-grid">
        {SAMPLE_RECIPES.map((recipe) => (
          <article className="recipe-card" key={recipe.id}>
            <div className="recipe-card-top">
              <span className="recipe-number">
                {String(recipe.id).padStart(2, "0")}
              </span>

              <span className="recipe-calories">
                {recipe.calories} kcal
              </span>
            </div>

            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>

            <div className="recipe-card-footer">
              <span>{recipe.portion}</span>

              <button type="button" className="text-button">
                Editar
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Recipes;
