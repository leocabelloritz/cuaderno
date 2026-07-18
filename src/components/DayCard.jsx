import MealSlot from "./MealSlot";

const MEALS = ["Desayuno", "Almuerzo", "Once", "Cena"];

function getMealCalories(meal) {
  if (!meal) {
    return 0;
  }

  const servings = meal.servings ?? 1;
  const baseCalories = meal.baseCalories ?? meal.calories ?? 0;

  return Math.round(baseCalories * servings);
}

function DayCard({
  person,
  targetPerson,
  day,
  meals,
  onOpenSelector,
  onRemoveMeal,
  onChangeServings,
  onCopyDay,
}) {
  const totalCalories = MEALS.reduce((total, mealName) => {
    return total + getMealCalories(meals?.[mealName]);
  }, 0);

  const hasMeals = meals && Object.keys(meals).length > 0;

  function handleCopyDay() {
    onCopyDay({
      fromPerson: person,
      toPerson: targetPerson,
      day,
    });
  }

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
            onChangeServings={(change) =>
              onChangeServings({
                person,
                day,
                meal: mealName,
                change,
              })
            }
          />
        ))}
      </div>

      <footer className="day-card-footer">
        <div>
          <span>Total diario</span>
          <strong>{totalCalories} kcal</strong>
        </div>

        <button
          type="button"
          className="copy-day-button"
          onClick={handleCopyDay}
          disabled={!hasMeals}
        >
          Copiar a {targetPerson}
        </button>
      </footer>
    </article>
  );
}

export default DayCard;
