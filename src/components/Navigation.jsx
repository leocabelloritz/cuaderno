function Navigation({ activeView, onChangeView }) {
  return (
    <nav className="main-navigation" aria-label="Navegación principal">
      <button
        type="button"
        className={`navigation-button ${
          activeView === "planner" ? "active" : ""
        }`}
        onClick={() => onChangeView("planner")}
      >
        <span aria-hidden="true">▦</span>
        Planificador
      </button>

      <button
        type="button"
        className={`navigation-button ${
          activeView === "recipes" ? "active" : ""
        }`}
        onClick={() => onChangeView("recipes")}
      >
        <span aria-hidden="true">▤</span>
        Preparaciones
      </button>
    </nav>
  );
}

export default Navigation;
