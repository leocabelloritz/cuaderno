function Header() {
  const editionDate = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">
        C
      </div>

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
    </header>
  );
}

export default Header;
