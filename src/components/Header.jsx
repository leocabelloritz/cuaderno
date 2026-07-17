import { colors } from "../styles/theme";

function Header() {
  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">
        C
      </div>

      <div>
        <p className="header-eyebrow">Recetario y menú semanal</p>
        <h1>Cuaderno</h1>
        <p className="header-description">
          Planifiquen la semana, ajusten sus porciones y guarden sus
          preparaciones favoritas.
        </p>
      </div>
    </header>
  );
}

export default Header;
