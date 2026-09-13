import heroImage from "../assets/hero.png";

function Header() {
  const editionDate = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="app-header editorial-hero">
      <div className="hero-microcopy hero-microcopy-left" aria-hidden="true">
        <span>Cocinar</span>
        <span>también</span>
        <span>es cuidar</span>
      </div>

      <div className="hero-microcopy hero-microcopy-center" aria-hidden="true">
        <span>Recetas</span>
        <span>Planificación</span>
        <span>Vida real</span>
      </div>

      <p className="hero-script" aria-hidden="true">Buenas comidas,<br />mejores días.</p>

      <div className="hero-brand-row">
        <div className="brand-mark" aria-hidden="true">C</div>

        <div className="header-copy">
          <div className="header-meta-row">
            <p className="header-eyebrow">Recetario doméstico</p>
            <span className="header-edition">Edición · {editionDate}</span>
          </div>

          <h1>Cuaderno</h1>
          <p className="header-description">
            Menús, preparaciones y porciones para comer bien durante la semana,
            sin convertir la cocina en una planilla.
          </p>
        </div>
      </div>

      <div className="hero-side-label" aria-hidden="true">
        <span>Ingredientes</span>
        <span>Ideas</span>
        <span>Personas</span>
        <span>Hogar</span>
      </div>

      <div className="hero-kitchen" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
    </header>
  );
}

export default Header;
