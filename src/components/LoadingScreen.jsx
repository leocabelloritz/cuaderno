function LoadingScreen({ message = "Cargando Cuaderno" }) {
  return (
    <main className="cuaderno-loader" role="status" aria-live="polite" aria-label={message}>
      <div className="cuaderno-loader-noise" aria-hidden="true" />
      <section className="cuaderno-loader-card">
        <div className="cuaderno-loader-mark" aria-hidden="true">
          <span>C</span>
          <i />
        </div>

        <div className="cuaderno-loader-copy">
          <p className="cuaderno-loader-kicker">Recetario doméstico</p>
          <h1>Cuaderno</h1>
          <p className="cuaderno-loader-message">{message}</p>
        </div>

        <div className="cuaderno-loader-progress" aria-hidden="true">
          <span />
        </div>

        <div className="cuaderno-loader-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
    </main>
  );
}

export default LoadingScreen;
