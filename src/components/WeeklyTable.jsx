import DayCard from "./DayCard";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function getMealCalories(meal) {
  if (!meal) {
    return 0;
  }

  const servings = meal.servings ?? 1;
  const baseCalories = meal.baseCalories ?? meal.calories ?? 0;

  return Math.round(baseCalories * servings);
}

function getMealMacro(meal, key) {
  if (!meal) {
    return 0;
  }

  const servings = meal.servings ?? 1;
  const baseValue = Number(meal[key] ?? 0);

  return baseValue * servings;
}

function WeeklyTable({
  person,
  targetPerson,
  subtitle,
  accent,
  planner,
  onOpenSelector,
  onRemoveMeal,
  onChangeServings,
  onCopyDay,
}) {
  const personPlanner = planner[person] || {};

  const weeklyNutrition = DAYS.reduce(
    (weekTotal, day) => {
      const dayMeals = personPlanner[day] || {};

      Object.values(dayMeals).forEach((meal) => {
        weekTotal.calories += getMealCalories(meal);
        weekTotal.protein += getMealMacro(meal, "baseProtein");
        weekTotal.carbs += getMealMacro(meal, "baseCarbs");
        weekTotal.fat += getMealMacro(meal, "baseFat");
      });

      return weekTotal;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <section className="weekly-section weekly-card-section">
      <header className="weekly-section-header">
        <div
          className="person-avatar"
          style={{ backgroundColor: accent }}
        >
          {person.charAt(0)}
        </div>

        <div className="person-heading-copy">
          <p className="weekly-kicker">Menú semanal</p>
          <h2>{person}</h2>
          <p className="person-subtitle">{subtitle}</p>
        </div>
      </header>

      <div className="days-grid">
        {DAYS.map((day) => (
          <DayCard
            key={day}
            person={person}
            targetPerson={targetPerson}
            day={day}
            meals={personPlanner[day]}
            onOpenSelector={onOpenSelector}
            onRemoveMeal={onRemoveMeal}
            onChangeServings={onChangeServings}
            onCopyDay={onCopyDay}
          />
        ))}
      </div>

      <footer className="weekly-summary">
        <div className="weekly-summary-main">
          <span>Total semanal</span>
          <strong>{weeklyNutrition.calories} kcal</strong>
          <small>
            Promedio diario: {Math.round(weeklyNutrition.calories / DAYS.length)} kcal
          </small>
        </div>

        <div className="weekly-macros" aria-label="Macros semanales">
          <span>
            <small>P</small>
            {Math.round(weeklyNutrition.protein)} g
          </span>
          <span>
            <small>C</small>
            {Math.round(weeklyNutrition.carbs)} g
          </span>
          <span>
            <small>G</small>
            {Math.round(weeklyNutrition.fat)} g
          </span>
        </div>
      </footer>
    </section>
  );
}

export default WeeklyTable;
