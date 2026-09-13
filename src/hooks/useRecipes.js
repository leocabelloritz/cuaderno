import { useEffect, useState } from "react";
import { initialRecipes } from "../data/initialRecipes";
import {
  createRecipe,
  deleteRecipeRemote,
  fetchRecipes,
} from "../services/supabaseService";

const STORAGE_KEY = "cuaderno-recipes";

function getStoredRecipes() {
  try {
    const storedRecipes = localStorage.getItem(STORAGE_KEY);
    return storedRecipes ? JSON.parse(storedRecipes) : initialRecipes;
  } catch {
    return initialRecipes;
  }
}

function mapRemoteRecipe(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    portion: recipe.portion,
    calories: Number(recipe.calories ?? 0),
    protein: Number(recipe.protein ?? 0),
    carbs: Number(recipe.carbs ?? 0),
    fat: Number(recipe.fat ?? 0),
    description: recipe.description || "",
    source: recipe.source,
    estimated: recipe.source === "ai",
    ingredients: recipe.ingredients || [],
  };
}

function useRecipes({ session, householdId } = {}) {
  const [recipes, setRecipes] = useState(getStoredRecipes);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    if (!session?.access_token || !householdId) return;

    let cancelled = false;

    async function loadRemote() {
      setSyncing(true);
      setSyncError("");
      try {
        const remote = await fetchRecipes(session.access_token, householdId);
        if (!cancelled) setRecipes(remote.map(mapRemoteRecipe));
      } catch (error) {
        if (!cancelled) setSyncError(error.message);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    loadRemote();
    return () => { cancelled = true; };
  }, [session?.access_token, householdId]);

  async function addRecipe(recipeData) {
    const newRecipe = { id: crypto.randomUUID(), ...recipeData };
    setRecipes((current) => [...current, newRecipe]);

    if (!session?.access_token || !householdId) return newRecipe;

    try {
      const saved = await createRecipe(
        session.access_token,
        householdId,
        session.user?.id,
        newRecipe,
      );
      const mapped = mapRemoteRecipe(saved);
      setRecipes((current) => current.map((recipe) => recipe.id === newRecipe.id ? mapped : recipe));
      return mapped;
    } catch (error) {
      setSyncError(error.message);
      throw error;
    }
  }

  async function deleteRecipe(recipeId) {
    const previous = recipes;
    setRecipes((current) => current.filter((recipe) => recipe.id !== recipeId));

    if (!session?.access_token || !householdId) return;

    try {
      await deleteRecipeRemote(session.access_token, householdId, recipeId);
    } catch (error) {
      setRecipes(previous);
      setSyncError(error.message);
      throw error;
    }
  }

  async function importLocalRecipes() {
    if (!session?.access_token || !householdId) return;

    const localRecipes = getStoredRecipes();
    setSyncing(true);
    setSyncError("");
    try {
      for (const recipe of localRecipes) {
        await createRecipe(
          session.access_token,
          householdId,
          session.user?.id,
          { ...recipe, id: recipe.id || crypto.randomUUID() },
        );
      }
      const remote = await fetchRecipes(session.access_token, householdId);
      setRecipes(remote.map(mapRemoteRecipe));
    } catch (error) {
      setSyncError(error.message);
      throw error;
    } finally {
      setSyncing(false);
    }
  }

  return { recipes, addRecipe, deleteRecipe, syncing, syncError, importLocalRecipes };
}

export default useRecipes;
