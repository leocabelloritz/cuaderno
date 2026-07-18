import { useState } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Planner from "./pages/Planner";
import Recipes from "./pages/Recipes";
import useRecipes from "./hooks/useRecipes";

function App() {
  const [activeView, setActiveView] = useState("planner");

  const {
    recipes,
    addRecipe,
    deleteRecipe,
  } = useRecipes();

  return (
    <div className="app-shell">
      <div className="decorative-line" />

      <Header />

      <Navigation
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {activeView === "planner" ? (
        <Planner recipes={recipes} />
      ) : (
        <Recipes
          recipes={recipes}
          onAddRecipe={addRecipe}
          onDeleteRecipe={deleteRecipe}
        />
      )}

      <footer className="app-footer">
        <span>Cuaderno</span>
        <span>Hecho para Victoria y Leo</span>
      </footer>
    </div>
  );
}

export default App;
