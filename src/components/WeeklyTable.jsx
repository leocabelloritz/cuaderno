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
    </section>
  );
}

export default WeeklyTable;
