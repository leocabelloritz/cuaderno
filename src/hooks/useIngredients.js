import { useCallback, useEffect, useState } from "react";
import {
  fetchIngredients,
  getCachedIngredients,
} from "../services/ingredientsService";

export function useIngredients() {
  const [ingredients, setIngredients] = useState(() =>
    getCachedIngredients(),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshIngredients = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const updatedIngredients = await fetchIngredients();
      setIngredients(updatedIngredients);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los ingredientes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadIngredients() {
      try {
        const updatedIngredients = await fetchIngredients();

        if (!isCancelled) {
          setIngredients(updatedIngredients);
          setError("");
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar los ingredientes.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadIngredients();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    ingredients,
    isLoading,
    error,
    refreshIngredients,
  };
}