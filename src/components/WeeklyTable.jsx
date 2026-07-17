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

function WeeklyTable({ person, subtitle, accent }) {
  return (
    <section className="weekly-section weekly-card-section">
      <div className="weekly-section-header">
        <div
          className="person-avatar"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        >
          {person.charAt(0)}
        </div>

        <div>
          <p className="section-label">Menú semanal</p>
          <h2>{person}</h2>
          <p className="person-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="days-grid">
        {DAYS.map((day) => (
          <DayCard key={`${person}-${day}`} day={day} person={person} />
        ))}
      </div>

      <div className="weekly-summary">
        <div>
          <span>Total semanal</span>
          <strong>0 kcal</strong>
        </div>

        <p>Las calorías se calcularán al agregar preparaciones.</p>
      </div>
    </section>
  );
}

export default WeeklyTable;
