function MealSlot({
  meal,
  selectedMeal,
  onAddMeal,
  onRemoveMeal,
}) {
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
          <div>
            <strong>{selectedMeal.name}</strong>

            <span>
              {selectedMeal.portion} · {selectedMeal.calories} kcal
            </span>
          </div>

          <button
            type="button"
            className="remove-meal-button"
            onClick={onRemoveMeal}
            aria-label={`Quitar ${selectedMeal.name}`}
          >
            ×
          </button>
        </div>
      ) : (
        <p className="meal-slot-empty">Sin preparación asignada</p>
      )}
    </div>
  );
}

export default MealSlot;
