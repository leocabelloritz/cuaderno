import MealSlot from "./MealSlot";

const MEALS = ["Desayuno", "Almuerzo", "Merienda", "Cena"];

function DayCard({ day, person }) {
  return (
    <article className="day-card">
      <header className="day-card-header">
        <div>
          <p className="day-card-label">Día</p>
          <h3>{day}</h3>
        </div>

        <span className="day-card-total">0 kcal</span>
      </header>

      <div className="day-card-meals">
        {MEALS.map((meal) => (
          <MealSlot
            key={`${person}-${day}-${meal}`}
            meal={meal}
            person={person}
            day={day}
          />
        ))}
      </div>

      <footer className="day-card-footer">
        <span>Total diario</span>
        <strong>0 kcal</strong>
      </footer>
    </article>
  );
}

export default DayCard;