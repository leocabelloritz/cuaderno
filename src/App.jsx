import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import AuthScreen from "./components/AuthScreen";
import Planner from "./pages/Planner";
import Recipes from "./pages/Recipes";
import useRecipes from "./hooks/useRecipes";
import {
  createHousehold,
  ensureFreshSession,
  getHouseholdMembership,
  getStoredSession,
  joinHousehold,
  signOut,
} from "./services/supabaseService";

function HouseholdSetup({ session, onReady }) {
  const [displayName, setDisplayName] = useState("");
  const [householdName, setHouseholdName] = useState("Casa");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "create") await createHousehold(session.access_token, householdName, displayName);
      else await joinHousehold(session.access_token, inviteCode, displayName);
      await onReady();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card household-card">
        <p className="section-label">Último paso</p>
        <h1>{mode === "create" ? "Crear hogar" : "Unirse al hogar"}</h1>
        <p className="auth-intro">El hogar reúne las recetas y el menú que compartirán entre sus cuentas.</p>
        <div className="setup-tabs">
          <button type="button" className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Crear hogar</button>
          <button type="button" className={mode === "join" ? "active" : ""} onClick={() => setMode("join")}>Usar código</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Tu nombre<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Leo o Vicky" required /></label>
          {mode === "create" ? (
            <label>Nombre del hogar<input value={householdName} onChange={(event) => setHouseholdName(event.target.value)} required /></label>
          ) : (
            <label>Código compartido<input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} placeholder="AB12CD34" required /></label>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button auth-submit" disabled={loading}>{loading ? "Guardando…" : mode === "create" ? "Crear hogar" : "Unirme"}</button>
        </form>
      </section>
    </main>
  );
}

function CopyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2"/><rect x="5" y="5" width="10" height="10" rx="2"/></svg>;
}
function ImportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 7.5h6l2 2h9v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" />
      <path d="M12 5v8" />
      <path d="m8.8 9.8 3.2 3.2 3.2-3.2" />
    </svg>
  );
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 16l4-4-4-4M19 12H9m6 7H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8"/></svg>;
}

function App() {
  const [activeView, setActiveView] = useState("planner");
  const [session, setSession] = useState(null);
  const [membership, setMembership] = useState(null);
  const [booting, setBooting] = useState(true);
  const [householdLoading, setHouseholdLoading] = useState(false);
  const [copiedInviteCode, setCopiedInviteCode] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);

  const household = membership?.households || null;
  const householdId = membership?.household_id || household?.id || null;
  const { recipes, addRecipe, deleteRecipe, syncing, syncError, importLocalRecipes } = useRecipes({ session, householdId });

  async function loadMembership(activeSession) {
    if (!activeSession?.access_token) { setMembership(null); return; }
    setHouseholdLoading(true);
    try { setMembership(await getHouseholdMembership(activeSession.access_token)); }
    finally { setHouseholdLoading(false); }
  }

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const stored = getStoredSession();
        if (!stored) return;
        const fresh = await ensureFreshSession(stored);
        if (cancelled) return;
        setSession(fresh);
        await loadMembership(fresh);
      } catch (error) {
        console.error("No fue posible restaurar la sesión:", error);
        signOut();
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  async function handleAuthenticated(newSession) { setSession(newSession); await loadMembership(newSession); setBooting(false); }
  function handleSignOut() { signOut(); setSession(null); setMembership(null); }

  const accountLabel = useMemo(() => membership?.display_name || session?.user?.email?.split("@")[0] || "Cuenta", [membership, session]);
  const accountInitial = accountLabel?.trim()?.charAt(0)?.toUpperCase() || "C";

  async function handleCopyInviteCode() {
    if (!household?.invite_code) return;
    try {
      await navigator.clipboard.writeText(household.invite_code);
      setCopiedInviteCode(true);
      window.setTimeout(() => setCopiedInviteCode(false), 1600);
    } catch (error) {
      console.error("No fue posible copiar el código:", error);
    }
  }

  if (booting) return <main className="auth-shell"><section className="auth-card"><p>Cargando Cuaderno…</p></section></main>;
  if (!session) return <AuthScreen onAuthenticated={handleAuthenticated} />;
  if (householdLoading) return <main className="auth-shell"><section className="auth-card"><p>Sincronizando hogar…</p></section></main>;
  if (!membership) return <HouseholdSetup session={session} onReady={() => loadMembership(session)} />;

  return (
    <div className="app-shell">
      <div className="decorative-line" />
      <Header />

      <section className="account-strip no-print" aria-label="Cuenta y sincronización">
        <div className="account-identity">
          <div className="account-avatar" aria-hidden="true">{accountInitial}</div>
          <div className="account-copy">
            <strong>{accountLabel}</strong>
            <div className="account-meta">
              <span>{household?.name || "Hogar"}</span>
              <span className="sync-dot" aria-hidden="true" />
              {syncing && <small>Sincronizando…</small>}
              {!syncing && !syncError && <small>Sincronizado</small>}
              {syncError && <small className="sync-error">{syncError}</small>}
            </div>
          </div>
        </div>

        <div className="account-code-block compact-code-block">
          <div className="account-code-header">
            <span className="account-code-label">Código de dispositivo</span>
            <button type="button" className="toggle-code-button" onClick={() => setShowInviteCode((current) => !current)}>
              {showInviteCode ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {showInviteCode && (
            household?.invite_code ? (
              <div className="account-code-box compact-code-box">
                <strong>{household.invite_code}</strong>
                <button type="button" className="icon-copy-button" onClick={handleCopyInviteCode} aria-label="Copiar código" title="Copiar código"><CopyIcon /></button>
                {copiedInviteCode && <small className="copy-feedback">Copiado</small>}
              </div>
            ) : <span className="invite-code"><strong>Sin código</strong></span>
          )}
        </div>

        <div className="account-actions">
          <button type="button" className="account-action-button" onClick={importLocalRecipes} aria-label="Importar recetas locales" title="Importar recetas locales"><ImportIcon /><span>Importar recetas locales</span></button>
          <button type="button" className="account-action-button" onClick={handleSignOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogoutIcon /><span>Cerrar sesión</span></button>
        </div>
      </section>

      <Navigation activeView={activeView} onChangeView={setActiveView} />
      {activeView === "planner" ? <Planner recipes={recipes} session={session} householdId={householdId} /> : <Recipes recipes={recipes} onAddRecipe={addRecipe} onDeleteRecipe={deleteRecipe} />}
      <footer className="app-footer"><span>Cuaderno</span><span>Hecho para Victoria y Leo</span></footer>
    </div>
  );
}

export default App;
