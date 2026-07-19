export function calculateIngredientNutrition(ingredient, amount) {
  if (!ingredient || !amount || amount <= 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }

  const referenceAmount = ingredient.referenceAmount ?? 100;
  const multiplier = amount / referenceAmount;

  return {
    calories: ingredient.calories * multiplier,
    protein: ingredient.protein * multiplier,
    carbs: ingredient.carbs * multiplier,
    fat: ingredient.fat * multiplier,
  };
}

export function calculateRecipeNutrition(recipeIngredients = []) {
  return recipeIngredients.reduce(
    (total, recipeIngredient) => {
      const nutrition = calculateIngredientNutrition(
        recipeIngredient.ingredient,
        recipeIngredient.amount,
      );

      return {
        calories: total.calories + nutrition.calories,
        protein: total.protein + nutrition.protein,
        carbs: total.carbs + nutrition.carbs,
        fat: total.fat + nutrition.fat,
      };
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
}

export function divideNutritionByServings(
  nutrition,
  servings = 1,
) {
  const safeServings = servings > 0 ? servings : 1;

  return {
    calories: nutrition.calories / safeServings,
    protein: nutrition.protein / safeServings,
    carbs: nutrition.carbs / safeServings,
    fat: nutrition.fat / safeServings,
  };
}

export function roundNutrition(nutrition) {
  return {
    calories: Math.round(nutrition.calories),
    protein: Number(nutrition.protein.toFixed(1)),
    carbs: Number(nutrition.carbs.toFixed(1)),
    fat: Number(nutrition.fat.toFixed(1)),
  };
}