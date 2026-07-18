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

function WeeklyTable({
  person,
  subtitle,
  accent,
  planner,
  onOpenSelector,
  onRemoveMeal,
}) {
  const personPlanner = planner[person] || {};

  const weeklyCalories = DAYS.reduce((weekTotal, day) => {
    const dayMeals = personPlanner[day] || {};

    const dayTotal = Object.values(dayMeals).reduce(
      (total, meal) => total + (meal?.calories || 0),
      0,
    );

    return weekTotal + dayTotal;
  }, 0);

  return (
    <section className="weekly-section weekly-card-section">
      <header className="weekly-section-header">
        <div
          className="person-avatar"
          style={{ backgroundColor: accent }}
        >
          {person.charAt(0)}
        </div>

        <div>
          <h2>{person}</h2>
          <p className="person-subtitle">{subtitle}</p>
        </div>
      </header>

      <div className="days-grid">
        {DAYS.map((day) => (
          <DayCard
            key={day}
            person={person}
            day={day}
            meals={personPlanner[day]}
            onOpenSelector={onOpenSelector}
            onRemoveMeal={onRemoveMeal}
          />
        ))}
      </div>

      <footer className="weekly-summary">
        <div>
          <span>Total semanal</span>
          <strong>{weeklyCalories} kcal</strong>
        </div>

        <p>
          Promedio diario:{" "}
          {Math.round(weeklyCalories / DAYS.length)} kcal
        </p>
      </footer>
    </section>
  );
}

export default WeeklyTable;
