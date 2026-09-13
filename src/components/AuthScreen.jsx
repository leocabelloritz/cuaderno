import { useState } from "react";
import { signIn, signUp } from "../services/supabaseService";

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        const result = await signUp(email.trim(), password);

        if (result?.access_token) {
          onAuthenticated(result);
        } else {
          setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso y luego inicia sesión.");
          setMode("login");
        }
      } else {
        const session = await signIn(email.trim(), password);
        onAuthenticated(session);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand-mark" aria-hidden="true">C</div>
        <p className="section-label">Cuaderno compartido</p>
        <h1>{mode === "login" ? "Entrar a Cuaderno" : "Crear cuenta"}</h1>
        <p className="auth-intro">
          Tus recetas y el menú semanal quedarán sincronizados entre todos tus dispositivos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="primary-button auth-submit" disabled={loading}>
            {loading ? "Procesando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          className="text-button auth-switch"
          onClick={() => {
            setMode((current) => current === "login" ? "register" : "login");
            setError("");
            setMessage("");
          }}
        >
          {mode === "login" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
        </button>
      </section>
    </main>
  );
}

export default AuthScreen;
