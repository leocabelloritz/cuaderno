function MealSlot({
  meal,
  selectedMeal,
  onAddMeal,
  onRemoveMeal,
  onChangeServings,
}) {
  const servings = selectedMeal?.servings ?? 1;

  const totalCalories = selectedMeal
    ? Math.round(
        (selectedMeal.baseCalories ?? selectedMeal.calories ?? 0) * servings,
      )
    : 0;

  return (
    <div className="meal-slot">
      <div className="meal-slot-header">
        <span>{meal}</span>

        <button
          type="button"
          className="meal-add-button"
          onClick={onAddMeal}
          aria-label={`Agregar preparación a ${meal}`}
        >
          ＋
        </button>
      </div>

      {selectedMeal ? (
        <div className="selected-meal">
          <div className="selected-meal-content">
            <div className="selected-meal-heading">
              <strong>{selectedMeal.name}</strong>

              <button
                type="button"
                className="remove-meal-button"
                onClick={onRemoveMeal}
                aria-label={`Quitar ${selectedMeal.name}`}
              >
                ×
              </button>
            </div>

            <span className="selected-meal-portion">
              {selectedMeal.portion}
            </span>

            <div className="servings-control">
              <button
                type="button"
                onClick={() => onChangeServings(-0.5)}
                disabled={servings <= 0.5}
                aria-label="Reducir media porción"
              >
                −
              </button>

              <div>
                <strong>
                  {servings.toLocaleString("es-CL", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </strong>

                <span>porciones</span>
              </div>

              <button
                type="button"
                onClick={() => onChangeServings(0.5)}
                aria-label="Agregar media porción"
              >
                ＋
              </button>
            </div>

            <div className="selected-meal-calories">
              <span>Total</span>
              <strong>{totalCalories} kcal</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className="meal-slot-empty">Sin preparación asignada</p>
      )}
    </div>
  );
}

export default MealSlot;
