import { useEffect, useState } from "react";
import { initialRecipes } from "../data/initialRecipes";

const STORAGE_KEY = "cuaderno-recipes";

function getStoredRecipes() {
  try {
    const storedRecipes = localStorage.getItem(STORAGE_KEY);

    if (!storedRecipes) {
      return initialRecipes;
    }

    return JSON.parse(storedRecipes);
  } catch (error) {
    console.error("No fue posible cargar las preparaciones:", error);
    return initialRecipes;
  }
}

function useRecipes() {
  const [recipes, setRecipes] = useState(getStoredRecipes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  function addRecipe(recipeData) {
    const newRecipe = {
      id: crypto.randomUUID(),
      ...recipeData,
    };

    setRecipes((currentRecipes) => [...currentRecipes, newRecipe]);
  }

  function deleteRecipe(recipeId) {
    setRecipes((currentRecipes) =>
      currentRecipes.filter((recipe) => recipe.id !== recipeId),
    );
  }

  return {
    recipes,
    addRecipe,
    deleteRecipe,
  };
}

export default useRecipes;
