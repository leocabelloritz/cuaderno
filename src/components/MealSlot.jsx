function MealSlot({ meal, person, day }) {
  return (
    <div className="meal-slot">
      <div className="meal-slot-header">
        <span>{meal}</span>

        <button
          type="button"
          className="meal-add-button"
          aria-label={`Agregar preparación al ${meal} del ${day} para ${person}`}
        >
          ＋
        </button>
      </div>

      <p className="meal-slot-empty">Sin preparaciones</p>
    </div>
  );
}

export default MealSlot;
