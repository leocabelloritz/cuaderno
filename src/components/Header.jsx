import heroImage from "../assets/hero.png";

function Header() {
  return (
    <header className="app-header editorial-hero">
      <div className="hero-brand-row">
        <div className="brand-mark" aria-hidden="true">C</div>

        <div className="header-copy">
          <p className="header-eyebrow">Recetario doméstico</p>
          <h1>Cuaderno</h1>
          <p className="header-description">
            Menús, preparaciones y porciones para comer bien durante la semana,
            sin convertir la cocina en una planilla.
          </p>
        </div>
      </div>

      <div className="hero-kitchen" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
    </header>
  );
}

export default Header;
