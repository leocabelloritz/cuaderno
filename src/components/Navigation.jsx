function Navigation({ activeView, onChangeView }) {
  return (
    <nav className="main-navigation" aria-label="Navegación principal">
      <button
        type="button"
        className={`navigation-button ${activeView === "planner" ? "active" : ""}`}
        onClick={() => onChangeView("planner")}
      >
        <span className="navigation-icon" aria-hidden="true">⌑</span>
        <strong>Planificador</strong>
      </button>

      <button
        type="button"
        className={`navigation-button ${activeView === "recipes" ? "active" : ""}`}
        onClick={() => onChangeView("recipes")}
      >
        <span className="navigation-icon" aria-hidden="true">▤</span>
        <strong>Preparaciones</strong>
      </button>
    </nav>
  );
}

export default Navigation;
