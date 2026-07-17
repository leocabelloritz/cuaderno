import WeeklyTable from "../components/WeeklyTable";
import { colors } from "../styles/theme";

function Planner() {
  return (
    <main className="page-content">
      <div className="page-introduction">
        <p className="section-label">Planificación familiar</p>
        <h2>El menú de esta semana</h2>
        <p>
          Agrega preparaciones a cada comida. Las porciones y calorías se
          calcularán de manera independiente para cada uno.
        </p>
      </div>

      <div className="planner-stack">
        <WeeklyTable
          person="Victoria"
          subtitle="Porción base: 1"
          accent={colors.terracotta}
        />

        <WeeklyTable
          person="Leo"
          subtitle="Porción base sugerida: 1,5"
          accent={colors.olive}
        />
      </div>
    </main>
  );
}

export default Planner;
