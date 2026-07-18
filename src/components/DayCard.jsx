import MealSlot from "./MealSlot";

const MEALS = ["Desayuno", "Almuerzo", "Once", "Cena"];

function DayCard({
  person,
  day,
  meals,
  onOpenSelector,
  onRemoveMeal,
}) {
  const totalCalories = MEALS.reduce((total, mealName) => {
    return total + (meals?.[mealName]?.calories || 0);
  }, 0);

  return (
    <article className="day-card">
      <header className="day-card-header">
        <div>
          <p className="day-card-label">Día</p>
          <h3>{day}</h3>
        </div>

        <span className="day-card-total">
          {totalCalories} kcal
        </span>
      </header>

      <div className="day-card-meals">
        {MEALS.map((mealName) => (
          <MealSlot
            key={mealName}
            meal={mealName}
            selectedMeal={meals?.[mealName]}
            onAddMeal={() =>
              onOpenSelector({
                person,
                day,
                meal: mealName,
              })
            }
            onRemoveMeal={() =>
              onRemoveMeal({
                person,
                day,
                meal: mealName,
              })
            }
          />
        ))}
      </div>

      <footer className="day-card-footer">
        <span>Total diario</span>
        <strong>{totalCalories} kcal</strong>
      </footer>
    </article>
  );
}

export default DayCard;
